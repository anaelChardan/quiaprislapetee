import { Play, newPlayId } from '../aggregate';

type Payload = {
  id: string;
};

export function createPlay(payload: Payload): Play {
  return {
    id: newPlayId(payload.id),
  };
}
