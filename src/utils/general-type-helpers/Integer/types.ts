import type { Brand } from '../Brand';
import type { BRAND_PROPERTY_NAME } from '../helpers/brand';

/**
 * An integer > 0.
 *
 * Construct with `toPositiveInteger`.
 */
export type PositiveInteger = Brand<number, 'PositiveInteger', BRAND_PROPERTY_NAME>;
