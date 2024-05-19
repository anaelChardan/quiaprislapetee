// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasStack(cause: any): cause is { stack: string } {
  return typeof cause === 'object' && typeof cause?.stack === 'string';
}

export class Oops<T extends object = {}> extends Error {
  public data?: T;

  public cause?: unknown;

  static readonly description: string = 'An error occured';

  constructor(message: string, data?: T) {
    super(message);
    this.data = data;
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this.constructor);
    }
  }

  wrap(cause: unknown): this {
    this.cause = cause;
    return this;
  }

  get fullstack(): string | undefined {
    const { stack, cause } = this;
    if (stack === undefined) {
      return undefined;
    }
    let fullstack = stack;
    if (cause !== undefined) {
      fullstack += '\ncaused by: ';
      if (hasStack(cause)) {
        fullstack += cause.stack;
      } else {
        fullstack += '<no stack>';
      }
    }
    return fullstack;
  }

  clone(): this {
    const clone = Object.create(Object.getPrototypeOf(this));
    Object.defineProperties(clone, Object.getOwnPropertyDescriptors(this));
    return clone;
  }

  toString(): string {
    const { name, message, cause } = this;
    if (!message && cause !== undefined) {
      return `${name}: ${String(cause)}`;
    }
    return `${name}: ${message}`;
  }

  toJSON(): {
    name: string;
    stack?: string;
    message: string;
    data?: {};
    cause?: unknown;
  } {
    return {
      name: this.name,
      stack: this.stack,
      message: this.message,
      data: this.data,
      cause: this.cause,
    };
  }
}
