import { DomainRepository } from '@utils/abstractions/domain-repository';
import { Play } from './aggregate';

export interface PlaysRepository {
  save: DomainRepository<Play['_id'], Play>['save'];
  upsert: DomainRepository<Play['_id'], Play>['upsert'];
  exists: DomainRepository<Play['_id'], Play>['exists'];
}
