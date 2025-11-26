const wrapElement = (el) => {
  return {
    el,
    first(selector) {
      return wrapElement(el.querySelector(selector));
    },
    set innerHTML(value) {
      el.innerHTML = value;
    },
    get innerHTML() {
      return el.innerHTML;
    },
    on(eventName, fn) {
      el.addEventListener(eventName, fn);
    },
    appendChild(child) {
      el.appendChild(child);
    },
    removeChild(child) {
      el.removeChild(child);
    }
  };
};

export const elementMethods = (selector = document) => {
  let el = null;
  if (typeof selector === 'string') {
    el = document.querySelector(selector);
  } else {
    el = selector;
  }
  return wrapElement(el);
};

export const template = (id) => {
  const el = document.querySelector('#' + id);
  return el ? el.innerHTML : '';
};