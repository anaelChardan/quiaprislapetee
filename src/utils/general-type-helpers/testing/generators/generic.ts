import { faker } from '@faker-js/faker';

export const generateEmail = () => faker.internet.email();
export const generateName = () => faker.company.name();
export const generateUrl = () => faker.internet.url();
