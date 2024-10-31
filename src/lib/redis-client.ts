import {
  createClient,
  RedisClientType,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from "redis";

// Type for configuration
interface RedisConfig {
  url: string;
  socket: {
    reconnectStrategy: (retries: number) => number;
  };
  enableOfflineQueue: boolean;
  commandTimeout: number;
}

// Type for the Redis client
type RedisClient = RedisClientType<RedisModules, RedisFunctions, RedisScripts>;

// Configuration object
const config: RedisConfig = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries: number): number => {
      // Maximum retry delay of 3 seconds
      return Math.min(retries * 100, 3000);
    },
  },
  enableOfflineQueue: true,
  commandTimeout: 5000,
};

// Singleton instance
let client: RedisClient | null = null;

// Gets a Redis client instance, creating one if it doesn't exist

async function getRedisClient(): Promise<RedisClient> {
  if (client !== null && client.isOpen) {
    return client;
  }

  client = createClient(config) as RedisClient;

  // Event handlers with type-safe error handling
  client.on("error", (error: Error) => {
    console.error("Redis Client Error:", error.message);
  });

  client.on("connect", () => {
    console.log("Redis Client Connected");
  });

  client.on("reconnecting", () => {
    console.log("Redis Client Reconnecting");
  });

  client.on("end", () => {
    console.log("Redis Client Connection Ended");
  });

  try {
    await client.connect();
  } catch (err) {
    console.error(
      "Redis Connection Error:",
      err instanceof Error ? err.message : String(err)
    );
    // Reset client on connection failure
    client = null;
    throw err;
  }

  // Graceful shutdown handler
  ["SIGINT", "SIGTERM"].forEach((signal: string) => {
    process.on(signal, async () => {
      if (client) {
        await client.quit();
        client = null;
        console.log("Redis connection closed.");
      }
      process.exit();
    });
  });

  return client;
}

export { getRedisClient };
export type { RedisClient, RedisConfig };
