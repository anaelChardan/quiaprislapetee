import { type DomainRepository } from '@utils/abstractions/domain-repository';
import { type Boardgame } from './aggregate';

export interface BoardgamesRepository {
  save: DomainRepository<Boardgame['_id'], Boardgame>['save'];
  upsert: DomainRepository<Boardgame['_id'], Boardgame>['upsert'];
  exists: DomainRepository<Boardgame['_id'], Boardgame>['exists'];
}
