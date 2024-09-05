import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

// A namespace for our v5 UUIDs. You can use any valid UUID here.
const NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

/**
 * Generates a UUID (Universally Unique Identifier)
 * @param {string} [name] - Optional name for v5 UUID generation
 * @returns {string} The generated UUID (v4 if no name, v5 if name provided)
 */
export function generateUUID(name?: string): string {
  if (name) {
    return uuidv5(name, NAMESPACE);
  }
  return uuidv4();
}
