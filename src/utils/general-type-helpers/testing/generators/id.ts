import { faker } from '@faker-js/faker';

export const generateId = () => faker.string.alphanumeric(8);
export const generateUuid = () => faker.string.uuid();
