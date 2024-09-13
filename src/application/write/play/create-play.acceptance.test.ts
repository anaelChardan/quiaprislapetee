import * as R from '@utils/general-type-helpers/Result';
import { generatePlayerId, newPseudo, PlayerId } from '@domain/players';
import { BoardgameId } from '@domain/boardgames';
import { CreatePlayCommandHandler } from './create-play';
import { setupContainer } from '../../../container';

describe('plays', () => {
  let createPlayCommandHandler: CreatePlayCommandHandler;
  let boardgameId: BoardgameId;

  let popeyeId: PlayerId;
  let nanouId: PlayerId;

  beforeAll(async () => {
    const container = setupContainer();
    createPlayCommandHandler = container.cradle.createPlayCommandHandler;

    boardgameId = await container.cradle.dummyBoardgame.randomOne({});

    popeyeId = generatePlayerId();
    nanouId = generatePlayerId();

    await container.cradle.dummyPlayer.randomOne({
      _id: popeyeId,
      pseudo: newPseudo('popeye'),
      friends: [],
    });

    await container.cradle.dummyPlayer.randomOne({
      _id: nanouId,
      pseudo: newPseudo('nanou'),
      friends: [],
    });
  });

  it('can create a play', async () => {
    const result = await createPlayCommandHandler.handle({
      id: '1',
      kind: 'createPlay',
      payload: {
        id: 'play-id',
        boardgameId,
        partyOwner: popeyeId,
        players: [
          { kind: 'nickname', nickname: 'JJ', score: 1 },
          { kind: 'user', score: 1000, userId: nanouId },
          { kind: 'user', score: 1000, userId: popeyeId },
        ],
      },
    });

    expect(result).toEqual(R.toSuccess({ id: 'play-id' }));
  });

  it('fails if the boardgame does not exist', async () => {
    const result = await createPlayCommandHandler.handle({
      id: '1',
      kind: 'createPlay',
      payload: {
        id: 'play-id',
        boardgameId: 'non-existing-boardgame-id',
        partyOwner: popeyeId,
        players: [
          { kind: 'nickname', nickname: 'JJ', score: 1 },
          { kind: 'user', score: 1000, userId: nanouId },
          { kind: 'user', score: 1000, userId: popeyeId },
        ],
      },
    });

    expect(R.isFailure(result)).toEqual(true);
  });
  it('fails if the owner does not exist', async () => {
    const result = await createPlayCommandHandler.handle({
      id: '1',
      kind: 'createPlay',
      payload: {
        id: 'play-id',
        boardgameId,
        partyOwner: generatePlayerId(),
        players: [
          { kind: 'nickname', nickname: 'JJ', score: 1 },
          { kind: 'user', score: 1000, userId: nanouId },
          { kind: 'user', score: 1000, userId: popeyeId },
        ],
      },
    });

    expect(R.isFailure(result)).toEqual(true);
  });
  it('fails if one of the players does not exist', async () => {
    const result = await createPlayCommandHandler.handle({
      id: '1',
      kind: 'createPlay',
      payload: {
        id: 'play-id',
        boardgameId,
        partyOwner: generatePlayerId(),
        players: [
          { kind: 'nickname', nickname: 'JJ', score: 1 },
          { kind: 'user', score: 1000, userId: nanouId },
          { kind: 'user', score: 1000, userId: generatePlayerId() },
        ],
      },
    });

    expect(R.isFailure(result)).toEqual(true);
  });
});
