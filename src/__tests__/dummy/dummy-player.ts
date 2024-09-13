import * as R from '@utils/general-type-helpers/Result';
import {
  generatePlayerId,
  newPlayerId,
  newPseudo,
  Player,
  PlayerId,
  PlayersRepository,
} from '@domain/players';
import { faker } from '@faker-js/faker';
import { DummyCreator } from './type';

export class DummyPlayer implements DummyCreator<Player> {
  constructor(private readonly playersRepository: PlayersRepository) {}

  async randomOne(partial: Partial<Player>): Promise<PlayerId> {
    const player: Player = {
      _id: newPlayerId(generatePlayerId().toString()),
      pseudo: newPseudo(faker.person.fullName()),
      friends: [],
      ...partial,
    };

    const result = await this.playersRepository.save(player);
    if (R.isSuccess(result)) {
      return player._id;
    }

    throw new Error('Failed to create player');
  }

  async randoms(count: number): Promise<PlayerId[]> {
    const players: PlayerId[] = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line no-await-in-loop
      const player = await this.randomOne({});
      players.push(player);
    }

    return players;
  }
}
