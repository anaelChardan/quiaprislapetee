/**
 * Util function to ensure that a given type is true at compile-time.
 * In combination with Equals, provides some compile-time guarantees about the
 * coherence of certain types.
 *
 * This is particularly relevant:
 * - in tests, to prove that a given function returns a given type
 * - in production code, to keep locally defined types in sync with an external
 *   system's types, e.g. custom fields, payables from bookkeeping, ...
 */
export function assertTypeIsTrue<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  T extends true,
>(): void {}

/**
 * Type helper allowing to compare two types and find out if they are equivalent.
 * This does deep comparison of recursive structures.
 *
 * Taken from https://github.com/microsoft/TypeScript/issues/27024#issuecomment-845655557
 */
export type Equals<A, B> = HalfEquals<A, B> extends true ? HalfEquals<B, A> : false;

type HalfEquals<A, B> = (
  A extends unknown
    ? (
        B extends unknown
          ? A extends B
            ? B extends A
              ? keyof A extends keyof B
                ? keyof B extends keyof A
                  ? A extends object
                    ? DeepHalfEquals<A, B, keyof A> extends true
                      ? 1
                      : never
                    : 1
                  : never
                : never
              : never
            : never
          : unknown
      ) extends never
      ? 0
      : never
    : unknown
) extends never
  ? true
  : false;

type DeepHalfEquals<A, B extends A, K extends keyof A> = (
  K extends unknown ? (Equals<A[K], B[K]> extends true ? never : 0) : unknown
) extends never
  ? true
  : false;
