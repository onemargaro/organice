import React, { PureComponent, Fragment } from 'react';

import './stylesheet.css';

import TitleLine from '../../../TitleLine';
import HabitConsistencyGraph from '../HabitConsistencyGraph';

import {
  isTodoKeywordCompleted,
  customFormatDistanceToNow,
  getPlanningItemTypeText,
  isHabit,
  isValidHabit,
} from '../../../../../../lib/org_utils';
import {
  dateForTimestamp,
  subtractTimestampUnitFromDate,
  addTimestampUnitToDate,
  getRepeaterOccurrenceTimestamps,
} from '../../../../../../lib/timestamps';

import {
  format,
  isToday,
  startOfDay,
  endOfDay,
  isBefore,
  isAfter,
  isEqual,
  isWithinInterval,
  isPast,
} from 'date-fns';
import classNames from 'classnames';
import { List } from 'immutable';

export default class AgendaDay extends PureComponent {
  handleHeaderClick(path, headerId) {
    return () => this.props.onHeaderClick(path, headerId);
  }

  render() {
    const {
      date,
      files,
      dateDisplayType,
      onToggleDateDisplayType,
      agendaDefaultDeadlineDelayValue,
      agendaDefaultDeadlineDelayUnit,
      orgHabitShowAllToday,
      orgHabitPrecedingDays,
      orgHabitFollowingDays,
    } = this.props;

    const dateStart = startOfDay(date);
    const dateEnd = endOfDay(date);

    const planningItemsAndHeaders = this.getPlanningItemsAndHeaders({
      files,
      date,
      agendaDefaultDeadlineDelayValue,
      agendaDefaultDeadlineDelayUnit,
      dateStart,
      dateEnd,
      orgHabitShowAllToday,
    });

    return (
      <div className="agenda-day__container">
        <div className="agenda-day__title">
          {isToday(date) && <div className="agenda-day__today-indicator" />}
          <div className="agenda-day__title__day-name">{format(date, 'eeee')}</div>
          <div className="agenda-day__title__date">{format(date, 'MMMM do, yyyy')}</div>
        </div>

        <div className="agenda-day__headers-container">
          <div>
            {planningItemsAndHeaders.map(([planningItem, header]) => {
              const planningItemDate = dateForTimestamp(planningItem.get('timestamp'));
              const hasTodoKeyword = !!header.getIn(['titleLine', 'todoKeyword']);

              const dateClassName = classNames('agenda-day__header-planning-date', {
                'agenda-day__header-planning-date--overdue':
                  hasTodoKeyword && isPast(planningItemDate),
              });

              return (
                <div
                  key={`${planningItem.get('id')}-${format(planningItemDate, 'x')}`}
                  className="agenda-day__header-container"
                >
                  <div className="agenda-day__header__planning-item-container">
                    <div className="agenda-day__header-planning-type">
                      {getPlanningItemTypeText(planningItem)}
                    </div>
                    <div className={dateClassName} onClick={onToggleDateDisplayType}>
                      {dateDisplayType === 'absolute'
                        ? format(planningItemDate, 'MM/dd')
                        : customFormatDistanceToNow(planningItemDate)}

                      {planningItem.getIn(['timestamp', 'startHour']) && (
                        <Fragment>
                          <br />
                          {format(planningItemDate, 'h:mma')}
                        </Fragment>
                      )}
                    </div>
                  </div>
                  <div className="agenda-day__header__header-container">
                    <TitleLine
                      header={header}
                      color="var(--base03)"
                      hasContent={false}
                      isSelected={false}
                      shouldDisableActions
                      shouldDisableExplicitWidth
                      onClick={this.handleHeaderClick(header.get('path'), header.get('id'))}
                    />
                    {/* Show habit consistency graph for valid habits */}
                    {isValidHabit(header) && (
                      <HabitConsistencyGraph
                        header={header}
                        viewDate={date}
                        precedingDays={orgHabitPrecedingDays}
                        followingDays={orgHabitFollowingDays}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  getPlanningItemsAndHeaders({
    files,
    date,
    agendaDefaultDeadlineDelayValue,
    agendaDefaultDeadlineDelayUnit,
    dateStart,
    dateEnd,
    orgHabitShowAllToday,
  }) {
    const headers = List().concat(
      ...files
        .mapEntries(([path, file]) => [
          path,
          file.get('headers').map((header) => header.set('path', path)),
        ])
        .valueSeq()
    );
    const todoKeywordSets = files.map((file) => file.get('todoKeywordSets'));

    return headers
      .flatMap((header) => {
        // Check if this is a habit using the utility function
        const headerIsHabit = isHabit(header);
        const todoKeyword = header.getIn(['titleLine', 'todoKeyword']);
        const isCompletedTodo =
          todoKeyword &&
          isTodoKeywordCompleted(todoKeywordSets.get(header.get('path')), todoKeyword);

        return header.get('planningItems').flatMap((planningItem) => {
          const timestamp = planningItem.get('timestamp');
          if (!timestamp.get('isActive')) {
            return [];
          }

          // When org-habit-show-all-today is enabled and viewing today:
          // Show ALL habits (even if not scheduled or completed)
          if (orgHabitShowAllToday && headerIsHabit && isToday(date)) {
            return [[planningItem, header]];
          }

          if (isCompletedTodo) {
            return [];
          }

          const planningItemDate = dateForTimestamp(timestamp);

          // Falls back to projecting the repeater onto this day's [dateStart, dateEnd]
          // window when the literal stored date doesn't land here (e.g. a task
          // scheduled weeks ago with a `+1w` repeater, viewed in Week/Month view).
          const repeaterOccurrences = () =>
            getRepeaterOccurrenceTimestamps(timestamp, dateStart, dateEnd).map(
              (occurrenceTimestamp) => [planningItem.set('timestamp', occurrenceTimestamp), header]
            );

          switch (planningItem.get('type')) {
            case 'DEADLINE':
              if (isToday(date)) {
                if (isBefore(planningItemDate, new Date())) {
                  return [[planningItem, header]];
                }
                const [delayValue, delayUnit] = timestamp.get('delayType')
                  ? [timestamp.get('delayValue'), timestamp.get('delayUnit')]
                  : [agendaDefaultDeadlineDelayValue, agendaDefaultDeadlineDelayUnit];
                const appearDate = subtractTimestampUnitFromDate(
                  planningItemDate,
                  delayValue,
                  delayUnit
                );
                return isAfter(date, appearDate) || isEqual(date, appearDate)
                  ? [[planningItem, header]]
                  : [];
              } else {
                if (isWithinInterval(planningItemDate, { start: dateStart, end: dateEnd })) {
                  return [[planningItem, header]];
                }
                return repeaterOccurrences();
              }
            case 'SCHEDULED':
              let appearDate = planningItemDate;
              if (timestamp.get('delayType')) {
                const hasBeenRepeated = header
                  .get('propertyListItems')
                  .some((propertyListItem) => propertyListItem.get('property') === 'LAST_REPEAT');
                if (timestamp.get('delayType') === '--' && !hasBeenRepeated) {
                  appearDate = addTimestampUnitToDate(
                    planningItemDate,
                    timestamp.get('delayValue'),
                    timestamp.get('delayUnit')
                  );
                }
              }
              if (isToday(date) && isAfter(date, appearDate)) {
                return [[planningItem, header]];
              }
              if (isWithinInterval(appearDate, { start: dateStart, end: dateEnd })) {
                return [[planningItem, header]];
              }
              return repeaterOccurrences();
            default:
              return isWithinInterval(planningItemDate, { start: dateStart, end: dateEnd })
                ? [[planningItem, header]]
                : [];
          }
        });
      })
      .sortBy(
        ([planningItem, header]) => {
          const { startHour, startMinute, endHour, endMinute, month, day } = planningItem
            .get('timestamp')
            .toJS();
          return [
            isHabit(header) ? 0 : 1,
            startHour === undefined ? 1 : 0,
            startHour || 0,
            startMinute || 0,
            endHour || 0,
            endMinute || 0,
            month || 0,
            day || 0,
          ];
        },
        // Immutable.js's default comparator falls back to string comparison
        // for non-primitive values, which stringifies these arrays and
        // sorts e.g. hour 10 before hour 9 lexicographically. Compare the
        // key arrays numerically, element by element, instead.
        (a, b) => {
          for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return a[i] - b[i];
          }
          return 0;
        }
      );
  }
}
