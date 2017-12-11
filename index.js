const React = require('react');

function h(componentOrTag, properties, children) {
  // There are various cases of what might be passed in:
  //
  //  1. Tag + properties + string: h("p", { className: active }, "Hi there")
  //  2. Tag + properties + children: h("p", { className: active }, [ h("img"), h("img") ])
  //  3. Tag + string: h("p", "Hi there")
  //  4. Tag + children: h("p", [ h("img"), h("img") ])
  //  5. Tag + properties: h("img", { src: "/images/cat.jpg" })
  //  6. Tag on its own: h("img")
  //
  // The tag can also be a React component, e.g.,
  //   h(CountingApp, { state: 0 })
  //
  // Also, the tag can be HAML-like combinations of element, class, and ID:
  //
  //   h(".counter")
  //   h("#counter.")
  //   h("img#spinner")
  //   h("img.border")
  //   h("a#start.red.big.round")

  if (!properties) {
    return h(componentOrTag, {}, children);
  }

  // Case 3 or 4
  if (!children && isChildren(properties)) {
    return h(componentOrTag, {}, properties);
  }

  // When a selector, parse the tag name and fill out the properties object
  if (!componentOrTag) {
    throw new Error('Null component!');
  } else if (typeof componentOrTag === 'string') {
    const [component, extraProps] = parseTag(componentOrTag, properties);
    return createElement(component, Object.assign({}, properties, extraProps), children);
  } else {
    return createElement(componentOrTag, properties, children);
  }
}

function createElement(componentOrTag, props, children) {
  const args = [componentOrTag, props].concat(children);
  return React.createElement.apply(React, args);
}

function isChildren(x) {
  return typeof x === 'string' || Array.isArray(x) || React.isValidElement(x);
}

const classIdSplit = /([.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
const notClassId = /^\.|#/;

function parseTag(tag, props) {
  if (!tag) {
    return 'div';
  }

  const noId = Object.prototype.hasOwnProperty.call(props, 'id');
  const extraProps = {};

  const tagParts = tag.split(classIdSplit);
  let tagName = null;

  if (notClassId.test(tagParts[1])) {
    tagName = 'div';
  }

  const classes = [];

  tagParts.forEach((part) => {
    if (!part) {
      return;
    }

    const type = part.charAt(0);

    if (!tagName) {
      tagName = part;
    } else if (type === '.') {
      classes.push(part.slice(1));
    } else if (type === '#' && noId) {
      extraProps.id = part.slice(1);
    }
  });

  if (classes.length > 0) {
    if (props.className) {
      classes.push(props.className);
    }

    extraProps.className = classes.join(' ');
  }

  return [tagName.toLowerCase(), extraProps];
}

module.exports = h;
