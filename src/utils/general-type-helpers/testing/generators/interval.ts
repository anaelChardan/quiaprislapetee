import { fromValidDates } from '../../Date/date-interval';
import type { DateInterval } from '../../Date/date-interval';
import { generateRecentValidDate } from './valid-date';

export const generateRecentInterval = (): DateInterval =>
  fromValidDates([generateRecentValidDate(), generateRecentValidDate()]);
