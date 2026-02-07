import Redis from "ioredis";

let redis: any = null;

if (process.env.ENABLE_REDIS === "true") {
  redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: 6379,
    retryStrategy: () => null, // retry band
  });

  redis.on("error", (err: any) => {
    console.log("Redis error:", err.message);
  });
}
