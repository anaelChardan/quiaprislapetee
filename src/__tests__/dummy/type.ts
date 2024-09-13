export interface DummyCreator<T extends { _id: unknown }> {
  randomOne(partial: Partial<T>): Promise<T['_id']>;
  randoms(count: number): Promise<T['_id'][]>;
}
