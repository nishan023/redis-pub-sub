# Redis Pub/Sub

This example publishes a `bid.created` event to Redis and has multiple
subscribers listen on the `auction:bid-created` channel.

## Prerequisites

- Node.js installed
- Redis running on `localhost:6379`

You can start Redis with Docker:

```bash
docker run -d --name redis-pubsub-demo -p 127.0.0.1:6379:6379 redis:7
```

The scripts use `redis://localhost:6379` by default. To use another Redis
server, set the `REDIS_URL` environment variable before running a script.

## Install dependencies

```bash
npm install
```

## Run the example

Open three terminal windows in this project directory.

### Terminal 1: start subscriber A

```bash
node subscriber.mjs server-a
```

### Terminal 2: start subscriber B

```bash
node subscriber.mjs server-b
```

### Terminal 3: publish an event

```bash
node publisher.mjs
```

Both subscribers should receive and print the same `bid.created` event.
Run `node publisher.mjs` again to publish another event.

Press `Ctrl+C` in a subscriber terminal to stop it.

When you are finished, stop and remove the Docker container:

```bash
docker rm -f redis-pubsub-demo
```

## Redis URL

For a Redis server running at a different address, set `REDIS_URL`.

PowerShell:

```powershell
$env:REDIS_URL = "redis://localhost:6380"
node subscriber.mjs server-a
```

Command Prompt:

```bat
set REDIS_URL=redis://localhost:6380
node publisher.mjs
```
