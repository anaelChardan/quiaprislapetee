import * as R from '@utils/general-type-helpers/Result';
import { generatePlayerId, newPlayerId, newPseudo, PlayersRepository } from '@domain/players';
import { faker } from '@faker-js/faker';
import { Container } from '../../../../container';
import { getTestContainer } from '../../../../__tests__/test-container';

describe('MongoDbPlayersRepository', () => {
  let playersRepository: PlayersRepository;
  let container: Container;
  let shutdown: () => Promise<void>;

  beforeAll(async () => {
    const testContainer = await getTestContainer();
    container = testContainer.container;
    shutdown = testContainer.shutdown;
    playersRepository = container.playersRepository;
  });

  afterAll(async () => {
    await shutdown();
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
    const ids = await container.dummyPlayer.randoms(3);
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
    const pseudo = newPseudo(faker.person.fullName());

    await playersRepository.upsert({
      _id: newPlayerId(id),
      pseudo,
      friends: [],
    });

    const playerBeforeUpsert = await playersRepository.findOneById(newPlayerId(id));
    expect(playerBeforeUpsert).toMatchObject(R.toSuccess({ _id: newPlayerId(id), pseudo }));

    const newPseudoGenerated = newPseudo(faker.person.fullName());
    await playersRepository.upsert({
      _id: newPlayerId(id),
      pseudo: newPseudoGenerated,
      friends: [],
    });

    const playerAfterUpsert = await playersRepository.findOneById(newPlayerId(id));

    expect(playerAfterUpsert).toMatchObject(
      R.toSuccess({ _id: newPlayerId(id), pseudo: newPseudoGenerated }),
    );
  });
});
