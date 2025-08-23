// Polyfill for Event constructor required by Aptos wallet adapter
if (typeof global.EventTarget === 'undefined') {
  global.EventTarget = class EventTarget {
    listeners = {};
    
    addEventListener(type, listener) {
      if (!this.listeners[type]) {
        this.listeners[type] = [];
      }
      this.listeners[type].push(listener);
    }
    
    removeEventListener(type, listener) {
      if (this.listeners[type]) {
        this.listeners[type] = this.listeners[type].filter(l => l !== listener);
      }
    }
    
    dispatchEvent(event) {
      if (this.listeners[event.type]) {
        this.listeners[event.type].forEach(listener => listener(event));
      }
      return true;
    }
  };
}

// Also assign to window and self if they exist
if (typeof window !== 'undefined' && typeof window.EventTarget === 'undefined') {
  window.EventTarget = global.EventTarget;
}
if (typeof self !== 'undefined' && typeof self.EventTarget === 'undefined') {
  self.EventTarget = global.EventTarget;
}

if (typeof global.Event === 'undefined') {
  global.Event = class Event {
    constructor(type, options = {}) {
      this.type = type;
      this.bubbles = options.bubbles || false;
      this.cancelable = options.cancelable || false;
      this.defaultPrevented = false;
      this.target = null;
      this.currentTarget = null;
    }
    
    preventDefault() {
      this.defaultPrevented = true;
    }
    
    stopPropagation() {}
    stopImmediatePropagation() {}
  };
}

// Also assign to window and self if they exist
if (typeof window !== 'undefined' && typeof window.Event === 'undefined') {
  window.Event = global.Event;
}
if (typeof self !== 'undefined' && typeof self.Event === 'undefined') {
  self.Event = global.Event;
}

// Import the original expo-router entry after polyfills are set up
import 'expo-router/entry';