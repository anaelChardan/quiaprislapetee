import { BoardgameId } from '../../boardgame/aggregate';
import { PlayerId } from '../../player/aggregate';
import { Play, newPlayId } from '../aggregate';

type Payload = {
  id: string;
  boardgame: BoardgameId;
  partyOwner: PlayerId;
  players: {
    id?: PlayerId;
    name: string;
    score: number;
  }[];
};

export function createPlay(payload: Payload): Play {
  return {
    id: newPlayId(payload.id),
  };
}
