/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import fetchingReducer from '../fetchingReducer';
import { HOME_NARROW_STR, streamNarrow } from '../../utils/narrow';
import { DO_NARROW, MESSAGE_FETCH_START } from '../../actionConstants';

describe('fetchingReducer', () => {
  describe('DO_NARROW', () => {
    test('resets state', () => {
      const initialState = deepFreeze({
        '[]': { older: true, newer: true },
      });

      const action = deepFreeze({
        type: DO_NARROW,
        narrow: streamNarrow('some stream'),
      });

      const expectedState = {};

      const newState = fetchingReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('MESSAGE_FETCH_START', () => {
    test('if messages are fetched before or after the corresponding flag is set', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: { older: false, newer: false },
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_START,
        narrow: [],
        numBefore: 10,
        numAfter: 10,
      });

      const expectedState = {
        [HOME_NARROW_STR]: { older: true, newer: true },
      };

      const newState = fetchingReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if key for narrow does not exist, it is created and corresponding flags are set', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: { older: false, newer: false },
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_START,
        narrow: streamNarrow('some stream'),
        numBefore: 10,
        numAfter: 0,
      });

      const expectedState = {
        [HOME_NARROW_STR]: { older: false, newer: false },
        [JSON.stringify(streamNarrow('some stream'))]: { older: true, newer: false },
      };

      const newState = fetchingReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('MESSAGE_FETCH_COMPLETE', () => {
    test('sets corresponding fetching flags to false, if messages are received before or after', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: { older: true, newer: true },
      });

      const action = {
        ...eg.action.message_fetch_complete,
        narrow: [],
        numBefore: 10,
        numAfter: 0,
      };

      const expectedState = {
        [HOME_NARROW_STR]: { older: false, newer: true },
      };

      const newState = fetchingReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  test('if fetched messages are from a search narrow, ignore them', () => {
    const initialState = deepFreeze({
      [HOME_NARROW_STR]: { older: true, newer: true },
    });

    const action = deepFreeze({
      ...eg.action.message_fetch_complete,
      narrow: [{ operator: 'search', operand: 'some query' }],
    });

    const newState = fetchingReducer(initialState, action);

    expect(newState).toEqual(initialState);
  });
});
