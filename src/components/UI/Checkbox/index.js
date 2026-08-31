import React from 'react';
import { Motion } from 'react-motion';

import { interpolateColors, rgbaObject, rgbaString } from '../../../lib/color';
import { maybeSpring } from '../../../lib/reduced_motion';
import { handleKeyboardActivation } from '../../../lib/interaction';

import './stylesheet.css';

export default ({ state, onClick }) => {
  const uncheckedColor = rgbaObject(255, 255, 255, 1);
  const checkedColor = rgbaObject(238, 232, 213, 1);

  const checkboxStyle = {
    colorFactor: maybeSpring(
      {
        checked: 1,
        partial: 1,
        unchecked: 0,
      }[state],
      { stiffness: 300 }
    ),
  };

  return (
    <Motion style={checkboxStyle}>
      {(style) => {
        const backgroundColor = rgbaString(
          interpolateColors(uncheckedColor, checkedColor, style.colorFactor)
        );

        return (
          <div
            className="checkbox"
            onClick={onClick}
            style={{ backgroundColor }}
            role="checkbox"
            aria-checked={state === 'partial' ? 'mixed' : state === 'checked'}
            tabIndex={0}
            onKeyDown={handleKeyboardActivation(onClick)}
          >
            <div className="checkbox__inner-container">
              {state === 'checked' && <i className="fas fa-check" />}
              {state === 'partial' && <i className="fas fa-minus" />}
              {state === 'unchecked' && <i className="fas fa-square" />}
            </div>
          </div>
        );
      }}
    </Motion>
  );
};
