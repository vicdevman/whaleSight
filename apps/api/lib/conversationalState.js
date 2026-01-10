import { redis } from "../db/cache.js";

const STATE_TTL = 300;

export async function setState(chatId, data) {
  await redis.set(
    `tg:state:${chatId}`,
    JSON.stringify(data),
    { EX: STATE_TTL }
  );
}

export async function getState(chatId) {
  const state = await redis.get(`tg:state:${chatId}`);
  return state ? JSON.parse(state) : null;
}

export async function clearState(chatId) {
  await redis.del(`tg:state:${chatId}`);
}
