import * as fc from 'fast-check';
import { describe, it } from 'node:test';
import { assertSuccess, assertFailure } from '@utils/general-type-helpers/testing/node';
import { assertMatches } from '@utils/node-test-utils';
import { pipe } from '../../function';
import type { Integer } from '..';
import {
  toBoundedInteger,
  toInteger,
  toIntegerFromConstant,
  toPositiveInteger,
  toPositiveIntegerFromConstant,
} from '..';

describe('toInteger()', () => {
  it('parses integers', () => {
    fc.assert(
      fc.property(fc.integer(), (val) => {
        pipe(val, toInteger, assertSuccess);
      }),
    );
  });

  describe('Given values past the boundaries', () => {
    const moreThanMax = 5 + Number.MAX_SAFE_INTEGER;

    it('should fail', () => {
      assertFailure(toInteger(moreThanMax));
    });
  });

  it('should fail on other values', () => {
    fc.assert(
      fc.property(
        fc.double().filter((v) => v !== 0 && !Number.isInteger(v)),
        (val) => {
          pipe(val, toInteger, assertFailure);
        },
      ),
    );
  });
});

describe('toIntegerFromConstant()', () => {
  describe('Given non integer constants', () => {
    const a = 23.4;
    const b = 83.5;

    it('should not compile', () => {
      // @ts-expect-error we expect this compilation error
      toIntegerFromConstant(a);
      // @ts-expect-error we expect this compilation error
      toIntegerFromConstant(b);
    });
  });

  describe('Given an integer constant', () => {
    const a = 44;

    it('should return its value', () => {
      const result = toIntegerFromConstant(a);
      assertMatches(result, 44);
    });
  });
});

describe('toPositiveInteger()', () => {
  it('parses positive integers', () => {
    fc.assert(
      fc.property(
        fc.nat().filter((v) => v !== 0),
        (val) => {
          pipe(val, toPositiveInteger, assertSuccess);
        },
      ),
    );
  });

  describe('Given values past the boundaries', () => {
    const moreThanMax = 5 + Number.MAX_SAFE_INTEGER;

    it('should fail', () => {
      assertFailure(toPositiveInteger(moreThanMax));
    });
  });

  it('should fail on other values', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer().map((v) => (v > 0 ? -v : v)),
          fc.double().filter((v) => v !== 0 && !Number.isInteger(v)),
        ),
        (val) => {
          pipe(val, toPositiveInteger, assertFailure);
        },
      ),
    );
  });
});

describe('toPositiveIntegerFromConstant()', () => {
  describe('Given non positive integer constants', () => {
    const a = 23.4;
    const b = -83.5;
    const c = 0;

    it('should not compile', () => {
      // @ts-expect-error we expect this compilation error
      toPositiveIntegerFromConstant(a);
      // @ts-expect-error we expect this compilation error
      toPositiveIntegerFromConstant(b);
      // @ts-expect-error we expect this compilation error
      toPositiveIntegerFromConstant(c);
    });
  });

  describe('Given a positive integer constant', () => {
    const a = 44;

    it('should return its value', () => {
      const result = toPositiveIntegerFromConstant(a);
      assertMatches(result, 44);
    });
  });
});

describe('toBoundedInteger()', () => {
  it('parses an integer in the bound', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), fc.integer(), (val1, val2, val3) => {
        const [lowerBound, mid, upperBound] = [val1, val2, val3].sort((a, b) => a - b) as [
          Integer,
          Integer,
          Integer,
        ];

        pipe(mid, toBoundedInteger({ lowerBound, upperBound }), assertSuccess);
      }),
    );
  });

  it('rejects an integer not the bound', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (val1, val2) => {
        const lowerBound = val1 as Integer;
        const upperBound = val2 as Integer;

        pipe(lowerBound - 1, toBoundedInteger({ lowerBound, upperBound }), assertFailure);
        pipe(upperBound + 1, toBoundedInteger({ lowerBound, upperBound }), assertFailure);
      }),
    );
  });

  it('should fail on other values', () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.integer(), fc.integer()).filter((t) => t[0] < t[1]),
        fc.double().filter((v) => v !== 0 && !Number.isInteger(v)),
        ([lowerBound, upperBound], val) => {
          pipe(
            val,
            toBoundedInteger({
              lowerBound: lowerBound as Integer,
              upperBound: upperBound as Integer,
            }),
            assertFailure,
          );
        },
      ),
    );
  });
});
