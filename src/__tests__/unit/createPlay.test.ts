import { Effect } from 'effect';
import { container, setupContainer } from '../../container';

describe('plays', () => {
  it('can create a play', async () => {
    setupContainer();
    const { createPlayCommandHandler } = container.cradle;

    const result = await createPlayCommandHandler.handle({ id: '1' });
    expect(result).toEqual(Effect.succeed({ id: '1' }));
  });
});
