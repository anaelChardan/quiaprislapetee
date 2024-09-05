import { faker } from '@faker-js/faker';

type Amount = {
  amount: number;
  currency: string;
  precision: number;
};

export const generateAmount = (override: Partial<Amount> = {}): Amount => {
  return {
    amount: faker.number.int({ min: 1, max: 100_000 }),
    precision: faker.number.int({ min: 1, max: 10 }),
    currency: 'EUR',
    ...override,
  };
};
