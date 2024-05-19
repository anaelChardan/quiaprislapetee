import { Brand } from 'effect';

export type Play = {
  id: PlayId;
};
export type PlayId = string & Brand.Brand<'PlayId'>;
export const newPlayId = Brand.nominal<PlayId>();
