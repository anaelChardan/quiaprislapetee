import type { NonEmptyArray as NEA } from '../NonEmptyArray';
import { fromArray } from '../NonEmptyArray';

/**
 * @deprecated import from NEA module instead
 */
export function chunk<T>(data: NEA<T>, chunkSize: number): NEA<NEA<T>> {
  const result: Array<NEA<T>> = [];
  for (let index = 0; index < data.length; index += chunkSize) {
    result.push(fromArray(data.slice(index, index + chunkSize)) as NEA<T>);
  }

  return fromArray(result) as NEA<NEA<T>>;
}
