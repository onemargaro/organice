import { Map } from 'immutable';

import { getRepeaterOccurrenceTimestamps } from './timestamps';

describe('getRepeaterOccurrenceTimestamps', () => {
  const weeklyTimestamp = Map({
    isActive: true,
    year: '2024',
    month: '01',
    day: '01',
    dayName: 'Mon',
    repeaterType: '+',
    repeaterValue: '1',
    repeaterUnit: 'w',
  });

  test('projects weekly occurrences across a multi-week range', () => {
    const rangeStart = new Date(2024, 0, 15, 0, 0, 0);
    const rangeEnd = new Date(2024, 1, 5, 23, 59, 59);
    const occurrences = getRepeaterOccurrenceTimestamps(weeklyTimestamp, rangeStart, rangeEnd);
    expect(occurrences.map((timestamp) => timestamp.get('day'))).toEqual(['15', '22', '29', '05']);
  });

  test('includes the literal base date when it falls within the range', () => {
    const rangeStart = new Date(2024, 0, 1, 0, 0, 0);
    const rangeEnd = new Date(2024, 0, 1, 23, 59, 59);
    const occurrences = getRepeaterOccurrenceTimestamps(weeklyTimestamp, rangeStart, rangeEnd);
    expect(occurrences.map((timestamp) => timestamp.get('day'))).toEqual(['01']);
  });

  test('returns an empty list when no occurrence falls in the range', () => {
    const rangeStart = new Date(2024, 0, 2, 0, 0, 0);
    const rangeEnd = new Date(2024, 0, 7, 23, 59, 59);
    expect(getRepeaterOccurrenceTimestamps(weeklyTimestamp, rangeStart, rangeEnd)).toEqual([]);
  });

  test('returns an empty list for a non-repeating timestamp', () => {
    const nonRepeating = Map({ isActive: true, year: '2024', month: '01', day: '01' });
    const rangeStart = new Date(2024, 0, 1);
    const rangeEnd = new Date(2024, 11, 31);
    expect(getRepeaterOccurrenceTimestamps(nonRepeating, rangeStart, rangeEnd)).toEqual([]);
  });

  test('returns an empty list for a malformed zero-value repeater instead of looping forever', () => {
    const malformed = weeklyTimestamp.set('repeaterValue', '0');
    const rangeStart = new Date(2024, 0, 1);
    const rangeEnd = new Date(2024, 11, 31);
    expect(getRepeaterOccurrenceTimestamps(malformed, rangeStart, rangeEnd)).toEqual([]);
  });

  test('projects monthly occurrences correctly across varying month lengths', () => {
    const monthly = Map({
      isActive: true,
      year: '2024',
      month: '01',
      day: '31',
      dayName: 'Wed',
      repeaterType: '+',
      repeaterValue: '1',
      repeaterUnit: 'm',
    });
    const rangeStart = new Date(2024, 0, 1);
    const rangeEnd = new Date(2024, 3, 30, 23, 59, 59);
    const occurrences = getRepeaterOccurrenceTimestamps(monthly, rangeStart, rangeEnd);
    // date-fns addMonths clamps to the shorter month's last day (Jan 31 -> Feb 29 in a
    // leap year -> Mar 29 -> Apr 29), matching the same date-fns behavior applyRepeater
    // already relies on for '+'.
    expect(occurrences.map((timestamp) => [timestamp.get('month'), timestamp.get('day')])).toEqual(
      [
        ['01', '31'],
        ['02', '29'],
        ['03', '29'],
        ['04', '29'],
      ]
    );
  });
});
