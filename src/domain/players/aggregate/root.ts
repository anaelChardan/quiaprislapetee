import { removeNullValues } from '@utils/remove-null-values';
import { type PlayerId } from './id';
import { type Pseudo } from './pseudo';
import { type Friend } from './friend';

export type Player = {
  _id: PlayerId;
  pseudo: Pseudo;
  bggUsername?: string;
  friends: Friend[];
};

export type PlayerRawTypes = {
  _id: string;
  pseudo: string;
  bggUsername?: string;
  friends: Player['friends'];
};

export function toPlayerRawTypesWithoutNull(player: Player): PlayerRawTypes {
  const rawTypes = {
    _id: player._id.toString(),
    pseudo: player.pseudo.toString(),
    bggUsername: player.bggUsername,
    friends: player.friends,
  };

  return removeNullValues(rawTypes);
}
