import { Brand } from 'effect';

export type PlayerId = string & Brand.Brand<'PlayerId'>;
export const newPlayerId = Brand.nominal<PlayerId>();

export type Pseudo = string & Brand.Brand<'Pseudo'>;
export const newPseudo = Brand.refined<Pseudo>(
  (pseudo: string) => pseudo.length > 0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_pseudo: string) => Brand.error('Pseudo must not be empty'),
);

export type Player = {
  id: PlayerId;
  pseudo: Pseudo;
  bggUsername?: string;
};
