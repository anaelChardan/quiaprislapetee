import assert from 'node:assert';
import { assertMatches } from '@utils/node-test-utils';
import { describe, it } from 'node:test';
import { brandedTypeSchema, identity, make, type Brand } from '../index';

type BrandString = Brand<string, 'BrandString'>;
type BrandNumber = Brand<number, 'BrandNumber'>;
type BrandBoolean = Brand<boolean, 'BrandBoolean'>;

describe('identity()', () => {
  it('should return the same value for BrandString', () => {
    const base = 'test';
    const result = identity<BrandString>(base);
    assert.strictEqual(result, base);
    assert.strictEqual(typeof result, 'string');
  });

  it('should return the same value for BrandNumber', () => {
    const base = 42;
    const result = identity<BrandNumber>(base);
    assert.strictEqual(result, base);
    assert.strictEqual(typeof result, 'number');
  });

  it('should return the same value for BrandBoolean', () => {
    const base = true;
    const result = identity<BrandBoolean>(base);
    assert.strictEqual(result, base);
    assert.strictEqual(typeof result, 'boolean');
  });
});

describe('make()', () => {
  describe('given a branded maker', () => {
    const brandMaker = make<BrandString>();
    it('should create a maker fn', () => assertMatches(brandMaker('42'), '42'));
  });
});

describe('brandedTypeSchema()', () => {
  describe('given a branded schema', () => {
    const brandSchema = brandedTypeSchema<number, BrandNumber>('number');
    it('should properly parse data', () => {
      assertMatches(brandSchema.safeParse(42).success, true);
      assertMatches(brandSchema.safeParse('42').success, false);
    });
  });
});
