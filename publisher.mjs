import { randomUUID } from "node:crypto";
import { createClient } from "redis";

const CHANNEL = "auction:bid-created";

const publisher = createClient({
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
});

publisher.on("error", (error) => {
  console.error("Redis error:", error.message);
});

async function main() {
  try {
    await publisher.connect();

    // In your API, construct this AFTER the bid is saved.
    const event = {
      eventId: randomUUID(),
      type: "bid.created",
      auctionId: "auction-123",
      userId: "user-456",
      amount: 250,
      createdAt: new Date().toISOString(),
    };

    const subscriberCount = await publisher.publish(
      CHANNEL,
      JSON.stringify(event),
    );

    console.log("Published:", event);
    console.log("Redis reported subscribers:", subscriberCount);
  } finally {
    if (publisher.isReady) {
      await publisher.quit();
    } else if (publisher.isOpen) {
      publisher.destroy();
    }
  }
}

main().catch((error) => {
  console.error("Publishing failed:", error);
  process.exitCode = 1;
});