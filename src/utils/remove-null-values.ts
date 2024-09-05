type NonNullableProperties<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

export const removeNullValues = <T extends Record<string, unknown>>(
  obj: T,
): NonNullableProperties<T> => {
  return Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(obj).filter(([_, v]) => v !== null),
  ) as NonNullableProperties<T>;
};
