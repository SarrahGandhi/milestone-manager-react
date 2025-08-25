// Simple global event bus using DOM CustomEvent

export const emit = (name, detail) => {
  try {
    const event = new CustomEvent(name, { detail });
    window.dispatchEvent(event);
  } catch {
    // no-op
  }
};

export const on = (name, handler) => {
  const wrapped = (e) => handler(e.detail);
  window.addEventListener(name, wrapped);
  return () => window.removeEventListener(name, wrapped);
};

export const off = (name, handler) => {
  window.removeEventListener(name, handler);
};
