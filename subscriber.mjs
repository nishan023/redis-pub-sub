import { createClient } from "redis";

const CHANNEL = "auction:bid-created";
const subscriberName = process.argv[2] ?? "subscriber";

const subscriber = createClient({
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
});

// Keep an error listener attached to the Redis client.
subscriber.on("error", (error) => {
  console.error(`[${subscriberName}] Redis error:`, error.message);
});

subscriber.on("reconnecting", () => {
  console.log(`[${subscriberName}] Reconnecting...`);
});

async function main() {
  await subscriber.connect();

  await subscriber.subscribe(CHANNEL, (message, channel) => {
    try {
      // Redis transports a string; we decode our JSON event.
      const event = JSON.parse(message);

      if (
        event.type !== "bid.created" ||
        typeof event.auctionId !== "string" ||
        typeof event.amount !== "number" ||
        !Number.isFinite(event.amount)
      ) {
        console.error("Invalid bid event:", message);
        return;
      }

      console.log(`[${subscriberName}] Received on ${channel}:`);
      console.log(event);

      // In a real WebSocket server:
      // io.to(event.auctionId).emit("bid.created", event);
    } catch (error) {
      console.error("Could not process message:", error.message);
    }
  });

  console.log(`[${subscriberName}] Listening on ${CHANNEL}`);
}

let stopping = false;

async function shutdown() {
  if (stopping) return;
  stopping = true;

  try {
    if (subscriber.isReady) {
      await subscriber.unsubscribe(CHANNEL);
    }
  } finally {
    if (subscriber.isOpen) {
      subscriber.destroy();
    }
  }
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    shutdown().catch(console.error);
  });
}

main().catch((error) => {
  console.error("Subscriber startup failed:", error);

  if (subscriber.isOpen) {
    subscriber.destroy();
  }

  process.exitCode = 1;
});