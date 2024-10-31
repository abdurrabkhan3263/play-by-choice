import { createClient } from "redis";

let client: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (client === null) {
    client = createClient({
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    });

    client.on("error", (err) => console.error("Redis Client Error", err));

    await client.connect().catch(console.error);
  }

  return client;
}
