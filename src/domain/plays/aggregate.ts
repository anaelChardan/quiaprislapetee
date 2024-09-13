import { Brand } from 'effect';

export type PlayId = string & Brand.Brand<'PlayId'>;
export const newPlayId = Brand.nominal<PlayId>();

export type Play = {
  _id: PlayId;
};
