'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _urlParse = require('url-parse');

var _urlParse2 = _interopRequireDefault(_urlParse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isListening = false;

var listeners = [];

var onLink = function onLink(handler) {

  listeners.push(handler);

  var unsubscribe = function unsubscribe() {
    for (var i = 0; i < listeners.length; i++) {
      if (listeners[i] === handler) {
        listeners.splice(i, 1);
        break;
      }
    }
  };

  if (isListening) {
    return unsubscribe;
  }

  // This code borrows heavily from:
  // https://github.com/cerebral/addressbar/blob/master/index.js

  // Check if IE history polyfill is added
  var location = window.history.location || window.location;

  var initialUrl = location.href;
  var uri = (0, _urlParse2.default)(initialUrl);
  var origin = uri.protocol + '//' + uri.host;

  var emitChange = function emitChange(url, event) {
    listeners.forEach(function (listener) {
      listener(event);
    });
  };

  var isSameOrigin = function isSameOrigin(href) {
    return href && href.indexOf(origin) === 0;
  };

  var getClickedHref = function getClickedHref(event) {
    // check which button
    if ((event.which === null ? event.button : event.which) !== 1) {
      return false;
    }

    // check for modifiers
    if (event.metaKey || event.ctrlKey || event.shiftKey) {
      return false;
    }
    if (event.defaultPrevented) {
      return false;
    }

    // ensure link
    var element = event.target;
    while (element && element.nodeName !== 'A') {
      element = element.parentNode;
    }
    if (!element || element.nodeName !== 'A') {
      return false;
    }

    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (element.hasAttribute('download') || element.getAttribute('rel') === 'external') {
      return false;
    }

    // Check for mailto: in the href
    var href = element.getAttribute('href');
    if (href && href.indexOf('mailto:') > -1) {
      return false;
    }

    // check target
    if (element.target) {
      return false;
    }

    // x-origin
    if (!isSameOrigin(element.href)) {
      return false;
    }

    return href;
  };

  window.addEventListener(document.ontouchstart ? 'touchstart' : 'click', function (event) {
    var href = getClickedHref(event);
    if (href) {
      emitChange(href, event);
    }
  });

  return unsubscribe;
};

exports.default = onLink;