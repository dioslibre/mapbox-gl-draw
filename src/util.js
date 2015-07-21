'use strict';

module.exports.DOM = {};

/**
 * Captures mouse position
 *
 * @param {Object} e Mouse event
 * @param {Object} el Container element.
 * @returns {Point}
 */
module.exports.DOM.mousePos = function(e, el) {
  var rect = el.getBoundingClientRect();
  return new mapboxgl.Point(
    e.clientX - rect.left - el.clientLeft,
    e.clientY - rect.top - el.clientTop
  );
};

/**
 * Builds DOM elements
 *
 * @param {String} tag Element name
 * @param {String} [className]
 * @param {Object} [container] DOM element to append to
 * @param {Object} [attrbutes] Object containing attributes to apply to an
 * element. Attribute name corresponds to the key.
 * @returns {el} The dom element
 */
module.exports.DOM.create = function(tag, className, container, attributes) {
  var el = document.createElement(tag);
  if (className) el.className = className;
  if (attributes) {
    for (var key in attributes) {
      el.setAttribute(key, attributes[key]);
    }
  }
  if (container) container.appendChild(el);
  return el;
};

/**
 * Removes DOM elements
 *
 * @param {el} The DOM element
 */
module.exports.DOM.destroy = function(el) {
  el.parentElement.removeChild(el);
};

/**
 * Removes classes from an array of DOM elements
 *
 * @param {HTMLElement} elements
 * @param {String} klass
 */
module.exports.DOM.removeClass = function(elements, klass) {
  Array.prototype.forEach.call(elements, function(el) {
    el.classList.remove(klass);
  });
};

var docStyle = document.documentElement.style;

function testProp(props) {
  for (var i = 0; i < props.length; i++) {
    if (props[i] in docStyle) {
      return props[i];
    }
  }
}

var transformProp = testProp([
  'transform',
  'WebkitTransform'
]);

module.exports.DOM.setTransform = function(el, value) {
  el.style[transformProp] = value;
};

var selectProp = testProp([
  'userSelect',
  'MozUserSelect',
  'WebkitUserSelect',
  'msUserSelect'
]), userSelect;

module.exports.DOM.disableSelection = function () {
  if (selectProp) {
    userSelect = docStyle[selectProp];
    docStyle[selectProp] = 'none';
  }
};

module.exports.DOM.enableSelection = function () {
  if (selectProp) {
    docStyle[selectProp] = userSelect;
  }
};

/**
 * Translates geometries based on mouse movement
 *
 * @param {Object} feature A GeoJSON feature
 * @param {Array} init Initial position of the mouse
 * @param {Array} curr Current position of the mouse
 * @param {Object} map Instance of MapboxGL map
 * @param {Boolean} point Geometry is a point
 * @returns {Object} GeoJSON feature
 */

module.exports.translate = function(feature, init, curr, map, point) {
  if (point) {
    feature.geometry.coordinates = feature.geometry.coordinates;
    return feature;
  }

  var dx = curr.x - init.x;
  var dy = curr.y - init.y;
  var geom = feature.geometry;

  if (geom.type === 'Polygon')
    geom.coordinates = geom.coordinates
      .map(coord => coord.map(pt => translatePoint(pt, dx, dy, map)));
  else
    geom.coordinates = geom.coodinates.map(pt => translatePoint(pt, dx, dy, map));

  feature.geometry = geom;

  return feature;
};

// helper function for exports.translate
function translatePoint(point, dx, dy, map) {
  var c = map.project([ point[1], point[0] ]);
  c = map.unproject([ c.x + dx, c.y + dy ]);
  return [ c.lng, c.lat ];
}
