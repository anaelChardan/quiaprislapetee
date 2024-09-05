import { faker } from '@faker-js/faker';
import type { ValidDate } from '../../Date/valid-date';

export const generateRecentValidDate = (override?: Date): ValidDate =>
  override ? (override as ValidDate) : (faker.date.recent() as ValidDate);

export const generateFutureValidDate = (override?: Date): ValidDate =>
  override ? (override as ValidDate) : (faker.date.future() as ValidDate);
