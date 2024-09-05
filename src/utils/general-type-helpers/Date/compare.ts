import { compareNumbersAsc, Order } from '../Order';
import { type ValidDate } from './valid-date';

export const compareValidDatesAsc = (a: ValidDate, b: ValidDate): Order =>
  compareNumbersAsc(a.getTime(), b.getTime());
