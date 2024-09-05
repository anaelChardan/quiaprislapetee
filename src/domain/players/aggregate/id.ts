import { generateId } from '@utils/generate-id';
import { Brand } from 'effect';

export type PlayerId = string & Brand.Brand<'PlayerId'>;
export const newPlayerId = Brand.refined<PlayerId>(
  (id: string) => id.length === 24,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_id: string) => Brand.error('PlayerId must be 24 characters long'),
);

export const generatePlayerId = (): PlayerId => {
  return newPlayerId(generateId());
};
