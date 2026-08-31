import React from 'react';

import './stylesheet.css';
import { handleKeyboardActivation } from '../../../../../../../lib/interaction';

export default ({
  subPartDataAndHandlers: {
    onEnterListTitleEditMode,
    onEnterListContentsEditMode,
    onAddNewListItem,
    onRemoveListItem,
  },
}) => {
  return (
    <div className="list-action-drawer-container">
      <div className="list-action-drawer__row">
        <div
          className="list-action-drawer__edit-icon-container"
          onClick={onEnterListTitleEditMode}
          role="button"
          tabIndex={0}
          aria-label="Edit list item title"
          onKeyDown={handleKeyboardActivation(onEnterListTitleEditMode)}
        >
          <i className="fas fa-pencil-alt fa-lg" title="Edit list item title" />
        </div>

        <span className="list-action-drawer__separator" />

        <div
          className="list-action-drawer__edit-icon-container"
          onClick={onEnterListContentsEditMode}
          title="Edit list item contents"
          role="button"
          tabIndex={0}
          aria-label="Edit list item contents"
          onKeyDown={handleKeyboardActivation(onEnterListContentsEditMode)}
        >
          <i className="fas fa-edit fa-lg" />
        </div>

        <span className="list-action-drawer__separator" />

        <div
          className="list-action-drawer__edit-icon-container"
          onClick={onAddNewListItem}
          role="button"
          tabIndex={0}
          aria-label="Create list item below"
          onKeyDown={handleKeyboardActivation(onAddNewListItem)}
        >
          <i
            className="fas fa-plus fa-lg"
            data-testid="list-item-action-plus"
            title="Create list item below"
          />
        </div>

        <span className="list-action-drawer__separator" />

        <div
          className="list-action-drawer__edit-icon-container"
          onClick={onRemoveListItem}
          role="button"
          tabIndex={0}
          aria-label="Delete list item"
          onKeyDown={handleKeyboardActivation(onRemoveListItem)}
        >
          <i className="fas fa-times fa-lg" title="Delete list item" />
        </div>
      </div>
    </div>
  );
};
