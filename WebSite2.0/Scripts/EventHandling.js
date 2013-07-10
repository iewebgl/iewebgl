var EventHandler = (function () {

    var guid = 0

    function fixEvent(event) {
        event = event || window.event;

        if (event.isFixed) {
            return event;
        }
        event.isFixed = true;

        event.preventDefault = event.preventDefault || function () { this.returnValue = false };
        event.stopPropagation = event.stopPropagation || function () { this.cancelBubble = true };

        if (!event.target) {
            event.target = event.srcElement;
        }

        if (!event.relatedTarget && event.fromElement) {
            event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;
        }

        if (event.pageX == null && event.clientX != null) {
            var html = document.documentElement, body = document.body;
            event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
            event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
        }

        if (!event.which && event.button) {
            event.which = (event.button & 1 ? 1 : (event.button & 2 ? 3 : (event.button & 4 ? 2 : 0)));
        }

        return event;
    }

    function commonHandle(event) {
        event = fixEvent(event);

        var eventType = ((event.hasOwnProperty && event.hasOwnProperty("webglEventType")) || event.webglEventType != undefined) ?
            event.webglEventType : event.type;

        var handlers = this.events[eventType];

        for (var g in handlers) {
            var handler = handlers[g];

            var ret = handler.call(this, event);
            if (ret === false) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }

    function add(elem, eventType, handler, isWebglEvent) {
        if (elem.setInterval && (elem != window && !elem.frameElement)) {
            elem = window;
        }

        if (!handler.guid) {
            handler.guid = ++guid;
        }

        if (!elem.events) {
            elem.events = {};
            elem.handle = function (event) {
                if (typeof EventHandler !== "undefined") {
                    return commonHandle.call(elem, event);
                }
            }
        }

        if (!elem.events[eventType]) {
            elem.events[eventType] = {};

            if (elem.addEventListener)
                elem.addEventListener(eventType, elem.handle, false);
            else if (elem.attachEvent) {
                if(!isWebglEvent)
                    elem.attachEvent("on" + eventType, elem.handle);
                else if (!elem.webglEventInit) {
                    elem.attachEvent("onerror", elem.handle);
                    elem.webglEventInit = true;
                }
            }
        }

        elem.events[eventType][handler.guid] = handler;
    }

    return {
        addEvent: function (elem, type, handler) {
            add(elem, type, handler, false);
        },
        addWebGLEvent: function (elem, type, handler) {
            add(elem, type, handler, true);
        },
        removeEvent: function (elem, type, handler) {
            var handlers = elem.events && elem.events[type];

            if (!handlers) return;

            delete handlers[handler.guid];

            for (var any in handlers) return;
            if (elem.removeEventListener)
                elem.removeEventListener(type, elem.handle, false);
            else if (elem.detachEvent)
                elem.detachEvent("on" + type, elem.handle);

            delete elem.events[type];

            for (var any in elem.events) return;
            try {
                delete elem.handle;
                delete elem.events;
            } catch (e) { // IE
                elem.removeAttribute("handle");
                elem.removeAttribute("events");
            }
        }
    }
} ());

var addEvent = EventHandler.addEvent;
var addWebGLEvent = EventHandler.addWebGLEvent;
