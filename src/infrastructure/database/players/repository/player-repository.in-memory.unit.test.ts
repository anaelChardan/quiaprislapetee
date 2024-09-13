import * as R from '@utils/general-type-helpers/Result';
import {
  generatePlayerId,
  newPlayerId,
  newPseudo,
  Player,
  PlayersRepository,
} from '@domain/players';
import { faker } from '@faker-js/faker';
import { AppContainer, setupContainer } from '../../../../container';
import { DummyCreator } from '../../../../__tests__/dummy/type';

describe('InMemoryPlayersRepository', () => {
  let playersRepository: PlayersRepository;
  let container: AppContainer;
  let dummyPlayer: DummyCreator<Player>;
  beforeAll(async () => {
    container = setupContainer();
    const {
      playersRepository: playersRepositoryFromContainer,
      dummyPlayer: dummyPlayerFromContainer,
    } = container.cradle;

    playersRepository = playersRepositoryFromContainer;
    dummyPlayer = dummyPlayerFromContainer;
  });

  it('can create a player', async () => {
    const id = generatePlayerId().toString();

    const existsBefore = await playersRepository.exists(newPlayerId(id));

    expect(existsBefore).toEqual(R.toSuccess(false));

    const player = await playersRepository.save({
      _id: newPlayerId(id),
      pseudo: newPseudo(faker.person.fullName()),
      friends: [],
    });

    expect(player).toEqual(R.toSuccess({ _id: id }));
    const existsAfter = await playersRepository.exists(newPlayerId(id));
    expect(existsAfter).toEqual(R.toSuccess(true));
  });

  it('check that multiple players exists', async () => {
    const ids = await dummyPlayer.randoms(3);
    const playerExists = await playersRepository.allExists(ids);
    expect(playerExists).toEqual(R.toSuccess(true));

    const nonExistentPlayerExists = await playersRepository.allExists([
      ...ids,
      newPlayerId(generatePlayerId().toString()),
    ]);
    expect(nonExistentPlayerExists).toEqual(R.toSuccess(false));
  });

  it('can upsert a player', async () => {
    const id = generatePlayerId().toString();
    const playerId = newPlayerId(id);
    const pseudo = newPseudo(faker.person.fullName());

    await playersRepository.upsert({
      _id: playerId,
      pseudo,
      friends: [],
    });

    const playerBeforeUpsert = await playersRepository.findOneById(newPlayerId(id));
    expect(playerBeforeUpsert).toMatchObject(R.toSuccess({ _id: newPlayerId(id), pseudo }));

    const newPseudoGenerated = newPseudo(faker.person.fullName());
    await playersRepository.upsert({
      _id: playerId,
      pseudo: newPseudoGenerated,
      friends: [],
    });
    const playerAfterUpsert = await playersRepository.findOneById(newPlayerId(id));

    expect(playerAfterUpsert).toMatchObject(
      R.toSuccess({ _id: newPlayerId(id), pseudo: newPseudoGenerated }),
    );
  });
});
