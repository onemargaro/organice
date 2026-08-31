import React, { Fragment, useState } from 'react';

import './stylesheet.css';

import AttributedString from '../../../AttributedString';
import { handleKeyboardActivation } from '../../../../../../lib/interaction';

export default ({ propertyListItems, shouldDisableActions, onTimestampClick, onEdit }) => {
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(true);

  const handleCollapseToggle = () => setIsDrawerCollapsed(!isDrawerCollapsed);

  return propertyListItems.size === 0 ? null : (
    <div className="property-list-container">
      <div
        className="property-list__property"
        onClick={handleCollapseToggle}
        data-testid="property-list-properties-toggle"
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyboardActivation(handleCollapseToggle)}
      >
        :PROPERTIES:
        {isDrawerCollapsed ? '...' : ''}
      </div>

      {!isDrawerCollapsed && (
        <Fragment>
          {propertyListItems.map((propertyListItem, index) => (
            <div className="property-list__item-container" key={propertyListItem.get('id')}>
              <div
                className="property-list__property"
                onClick={shouldDisableActions ? null : onEdit}
                data-testid={`property-list-item-property-${index}`}
                role="button"
                tabIndex={shouldDisableActions ? -1 : 0}
                onKeyDown={handleKeyboardActivation(shouldDisableActions ? null : onEdit)}
              >
                :{propertyListItem.get('property')}:
              </div>
              <div
                className="property-list__value"
                data-testid={`property-list-item-value-${index}`}
              >
                <AttributedString
                  parts={propertyListItem.get('value') || []}
                  subPartDataAndHandlers={{
                    onTimestampClick,
                    shouldDisableActions,
                  }}
                />
              </div>
            </div>
          ))}

          <div
            className="property-list__property"
            onClick={onEdit}
            data-testid="property-list-end"
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyboardActivation(onEdit)}
          >
            :END:
          </div>
        </Fragment>
      )}
    </div>
  );
};
