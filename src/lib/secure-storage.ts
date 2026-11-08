import * as SecureStore from "expo-secure-store";

const CHUNK_SIZE = 1900;

export const secureStorage = {
  /** Reads a value from one secure-store entry or its ordered chunk entries. */
  async getItem(key: string) {
    const count = Number(await SecureStore.getItemAsync(`${key}.count`));
    if (!count) return SecureStore.getItemAsync(key);
    const chunks = await Promise.all(
      Array.from({ length: count }, (_, index) =>
        SecureStore.getItemAsync(`${key}.${index}`),
      ),
    );
    return chunks.every((chunk) => chunk !== null) ? chunks.join("") : null;
  },
  /** Replaces a secure value with chunks small enough for platform storage limits. */
  async setItem(key: string, value: string) {
    await this.removeItem(key);
    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "gs")) ?? [];
    await Promise.all(
      chunks.map((chunk, index) =>
        SecureStore.setItemAsync(`${key}.${index}`, chunk),
      ),
    );
    await SecureStore.setItemAsync(`${key}.count`, String(chunks.length));
  },
  /** Removes both legacy single-entry data and every chunk for the supplied key. */
  async removeItem(key: string) {
    const count = Number(await SecureStore.getItemAsync(`${key}.count`));
    await Promise.all([
      SecureStore.deleteItemAsync(key),
      SecureStore.deleteItemAsync(`${key}.count`),
      ...Array.from({ length: count || 0 }, (_, index) =>
        SecureStore.deleteItemAsync(`${key}.${index}`),
      ),
    ]);
  },
};
