/** Wraps a click handler so Enter/Space also activate it, for non-native
interactive elements (role="button"/"checkbox"/"switch" on a div/span). */
export const handleKeyboardActivation = (handler) => (event) => {
  if (!handler) {
    return;
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handler(event);
  }
};
