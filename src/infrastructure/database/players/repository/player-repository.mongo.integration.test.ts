import * as R from '@utils/general-type-helpers/Result';
import { generatePlayerId, newPlayerId, newPseudo, PlayersRepository } from '@domain/players';
import { faker } from '@faker-js/faker';
import { container, setupContainer } from '../../../../container';
import { saveRandomDummyPlayers } from '../../../../__tests__/dummy';

describe('MongoDbPlayersRepository', () => {
  let playersRepository: PlayersRepository;
  beforeAll(async () => {
    setupContainer();
    const { mongoDbClient, playersRepository: playersRepositoryFromContainer } = container.cradle;
    await mongoDbClient.ping();
    playersRepository = playersRepositoryFromContainer;
  });

  afterAll(async () => {
    const { mongoDbClient } = container.cradle;
    await mongoDbClient.close();
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

    expect(player).toEqual(R.toSuccess({ id }));
    const existsAfter = await playersRepository.exists(newPlayerId(id));
    expect(existsAfter).toEqual(R.toSuccess(true));
  });

  it('check that multiple players exists', async () => {
    const ids = await saveRandomDummyPlayers(3);
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
