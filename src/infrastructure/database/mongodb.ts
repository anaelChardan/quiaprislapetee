import { IdPersistence } from '@utils/abstractions/contracts';
import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb';

export class MongoDbClient {
  private client: MongoClient;

  private database: Db | undefined;

  private isConnected: boolean = false;

  constructor(private readonly DATABASE_URL: string) {
    this.client = new MongoClient(this.DATABASE_URL, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    this.database = undefined;
  }

  async db(): Promise<Db> {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
    }

    if (!this.database) {
      this.database = this.client.db();
    }

    return this.database;
  }

  async ping(): Promise<void> {
    await this.database?.command({ ping: 1 });
  }

  async collection<T extends IdPersistence>(collectionName: string): Promise<Collection<T>> {
    const db = await this.db();

    return db.collection<T>(collectionName);
  }

  async close(): Promise<void> {
    await this.client.close();
    this.isConnected = false;
  }
}
