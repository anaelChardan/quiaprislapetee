import z from 'zod';
import { type Player } from './root';

export const friendSchema = z.union([
  z.object({
    kind: z.literal('nickname'),
    nickname: z.string(),
  }),
  z.object({
    kind: z.literal('user'),
    userId: z.string(),
  }),
]);

export type Friend = z.infer<typeof friendSchema>;

export function isEqualTo(friend: Friend) {
  return (friendToCompare: Friend): boolean => {
    if (friend.kind === 'nickname' && friendToCompare.kind === 'nickname') {
      return friend.nickname === friendToCompare.nickname;
    }

    if (friend.kind === 'user' && friendToCompare.kind === 'user') {
      return friend.userId === friendToCompare.userId;
    }

    return false;
  };
}

export function addFriend(player: Player, friendToAdd: Friend): Player {
  if (friendToAdd.kind === 'user' && friendToAdd.userId === player._id) {
    return player;
  }

  const friendshipAlreadyExists = player.friends.some(isEqualTo(friendToAdd));
  if (friendshipAlreadyExists) {
    return player;
  }

  return {
    ...player,
    friends: [...player.friends, friendToAdd],
  };
}

export function addFriends(player: Player, friendsToAdd: Friend[]): Player {
  return friendsToAdd.reduce(addFriend, player);
}
