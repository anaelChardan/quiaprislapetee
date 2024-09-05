/* eslint-disable no-control-regex */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as R from '@utils/general-type-helpers/Result';
import { assertFailure } from '@utils/general-type-helpers/testing/node';
import {
  anyValue,
  arrayContaining,
  objectContaining,
  stringIncluding,
  stringMatching,
  valueOfType,
} from '../../matchers';
import { assertMatches } from '../assert-matches';

describe('Given a complex expected leveraging matchings', () => {
  const expected = {
    a: 'some value',
    b: objectContaining({
      foo: 'hi',
    }),
    c: objectContaining({
      bar: valueOfType(Number),
    }),
    d: arrayContaining(['one']),
    e: objectContaining({
      foo: stringIncluding('ba'),
      baz: stringMatching(/^q.*$/),
    }),
    f: arrayContaining([valueOfType(Number)]),
    g: anyValue(),
  };

  describe('Given a value that does not match expected', () => {
    const actual = {
      a: 5,
      b: null,
      c: undefined,
      d: ['two'],
      e: { nope: 'nope' },
      f: null,
    };

    it('should fail', () => {
      assert.throws(() => assertMatches(actual, expected));
    });
  });

  describe('Given a value that matches expected', () => {
    const actual = {
      a: 'some value',
      b: {
        foo: 'hi',
        bar: 'baz',
      },
      c: {
        bar: 5,
        qux: 'some nice message',
      },
      d: ['two', 'one', 'three'],
      e: {
        foo: 'bar',
        baz: 'qux',
        some: 'other prop',
      },
      f: [1],
      g: undefined,
    };

    it('should pass', () => {
      assertMatches(actual, expected);
    });
  });
});

describe('Diffs', () => {
  describe('Given an expectation for an object with a complete structure', () => {
    const expected = {
      a: 'some value',
      b: objectContaining({
        foo: 'hi',
      }),
      c: objectContaining({
        bar: valueOfType(Number),
      }),
      d: arrayContaining(['one']),
      // The following should match properly
      e: objectContaining({
        foo: stringIncluding('ba'),
        baz: stringMatching(/^q.*$/),
      }),
      f: arrayContaining([valueOfType(Number)]),
      g: anyValue(),
    };
    const actual = {
      a: 10,
      b: 44,
      c: {
        bar: 'some string',
      },
      d: ['baz'],
      e: { foo: 'bar', baz: 'qux', otherProp: 10 },
      f: [3, 1, 2],
      g: null,
    };

    it('should return a diff outlining all issues', () => {
      const error = assertFailure(
        R.tryCatch(
          () => assertMatches(actual, expected),
          (err) => err,
        ),
      ) as assert.AssertionError;

      const errorMessageWithoutColor = error.message.replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        '',
      );

      assert.strictEqual(
        errorMessageWithoutColor.includes(`- Expected
+ Received

  Object {
-   "a": "some value",
-   "b": ObjectContaining {
-     "foo": "hi",
-   },
-   "c": ObjectContaining {
-     "bar": ValueOfType<Number>,
+   "a": 10,
+   "b": 44,
+   "c": Object {
+     "bar": "some string",
    },
-   "d": ArrayContaining [
-     "one",
+   "d": Array [
+     "baz",
    ],
    "e": ObjectContaining {
      "baz": StringMatching</^q.*$/>,
      "foo": StringIncluding<"ba">,
    },
    "f": ArrayContaining [
      ValueOfType<Number>,
    ],
    "g": AnyValue,
  }`),
        true,
      );
    });

    it('should inclue the message if passed', () => {
      const error = assertFailure(
        R.tryCatch(
          () => assertMatches(actual, expected, 'my custom message'),
          (err) => err,
        ),
      ) as assert.AssertionError;

      assert.strictEqual(error.message.includes('my custom message'), true);
    });
  });
});
