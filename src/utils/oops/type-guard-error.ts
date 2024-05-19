import { Oops } from './oops';

export class TypeGuardError<T extends {} = {}> extends Oops<T> {
  constructor(_switchCase: never, message: string, data?: T) {
    super(message, data);
  }
}
