
import 'core-js/features/promise';
import 'core-js/features/array/from';
import 'core-js/features/symbol';
import 'unfetch/polyfill/index.js';
import 'svg-classlist-polyfill';

(function (arr) {
    arr.forEach(function (item) {
      if (item.hasOwnProperty('remove')) {
        return;
      }
      Object.defineProperty(item, 'remove', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function remove() {
          if (this.parentNode === null) {
            return;
          }
          this.parentNode.removeChild(this);
        }
      });
    });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

(function() {
    if (typeof window.CustomEvent === "function") return false
  
    function CustomEvent(event, params) {
      params = params || { bubbles: false, cancelable: false, detail: undefined }
      var evt = document.createEvent("CustomEvent")
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
      return evt
    }
  
    CustomEvent.prototype = window.Event.prototype
  
    window.CustomEvent = CustomEvent
})();

if (!document.elementsFromPoint) {
    if(!document.msElementsFromPoint)
        document.elementsFromPoint = function(x, y) {
            var parents = [];
            var parent = void 0;
            do {
                if (parent !== document.elementFromPoint(x, y)) {
                    parent = document.elementFromPoint(x, y);
                    parents.push(parent);
                    parent.style.pointerEvents = 'none';
                } else {
                    parent = false;
                }
            } while (parent);
            parents.forEach(function (parent) {
                return parent.style.pointerEvents = 'all';
            });
            return parents;
        };
    else
        document.elementsFromPoint = function(x, y) {
            var nl = document.msElementsFromPoint(x, y);
            if(nl.length < 1)
                return [];
            return Array.from(nl);
        };
}

if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || 
                                Element.prototype.webkitMatchesSelector;
}
  
if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
      var el = this;
  
      do {
        if (Element.prototype.matches.call(el, s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
}

(function () {
	"use strict";

	if (!("parentElement" in Document.prototype) || !("parentElement" in Text.prototype) || !("parentElement" in Attr.prototype)) {
		// Environment doesn't support 'parentElement' or only supports it on nodes that are Elements themselves.
		// To unify behavior between all browsers and to be spec-compliant, parentElement should be supported on any Node.

		function implementation () {
			return this.parentNode instanceof Element ? this.parentNode : null;
		}

		try {
			Object.defineProperty(Attr.prototype, "parentElement", { configurable: false, enumerable: false, get: implementation });
		} catch (e) {
			// IE8
			Attr.prototype.parentElement = implementation;
		}

		try {
			Object.defineProperty(Text.prototype, "parentElement", { configurable: false, enumerable: false, get: implementation });
		} catch (e) {
			// IE8
			Text.prototype.parentElement = implementation;
		}

		try {
			Object.defineProperty(Element.prototype, "parentElement", { configurable: false, enumerable: false, get: implementation });
		} catch (e) {
			// IE8
			Element.prototype.parentElement = implementation;
		}

		try {
			Object.defineProperty(Document.prototype, "parentElement", { configurable: false, enumerable: false, get: implementation });
		} catch (e) {
			// IE8
			Document.prototype.parentElement = implementation;
		}

	}
}());

if(!Node.prototype.contains)
    Node.prototype.contains = function contains(node) {
        if (!(0 in arguments)) {
            throw new TypeError('1 argument is required');
        }

        do {
            if (this === node) {
                return true;
            }
        } while (node = node && node.parentNode);

        return false;
    };