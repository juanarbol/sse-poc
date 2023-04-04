## SSE Zero[M]Q PoC

This is a minimal repro case about what it would be to implement Server-sent
events with basic token authentication.

This is a vanilla `http` server using Node.js. No frameworks, no nothing.

This server is quite simple, it has 3 endpoints and it responds to stdin as
well.

### The `/stream` endpoint

The `/stream` endpoint will stablish the connection with our SSE server and will
subscribe from events (Tickets) based on the provided token, each client should
provide the auth token via url, like: `/stream?token=MySafeToken`


For this poc, the list of tokens are `foo`, `bar` and `baz`. If the client
provides the token `foo` it will be subscribed to the `TicketFoo` entity, for
tokens `bar` and `baz`, the client will listen to `TicketFoo` and `TicketMaster`
entities.

### The `/emit-foo` endpoint

Each time a client reach this endpoint, it will trigger a `changes` event in the
`TicketFoo` entity (the response of this endpoint is irrelevant)

### The `/emit-bar` endpoint

Each time a client reach this endpoint, it will trigger a `changes` event in the
`TicketFoo` and the `TicketMaster` entity (the response of this endpoint is
irrelevant)


## How to run this?

Start the server with `node index.js` to start the server. That's it.

For start consuming this server with a client, you could seee the `client.js`
file in this project and copy/paste it in your browser's console.

Or use curl (like this):

`$ curl http://localhost:3000/stream\?token\=bar` (to consume events by
`TicketFoo` and `TicketMaster` entities).

`$ curl http://localhost:3000/stream\?token\=foo` (to consume events by
`TicketFoo` entity).


To emit just one event, go to the Node.js server, and type `foo` for emmit an
event in `TicketFoo` and type `bar` for emit in `TicketFoo` and `TicketMaster`.
Remember to hit enter to send that to the Node.js stdin.

__This needs to be load-tested__
simple, `$ npx autocannon 127.0.0.1:3000/emit-bar -a 10000` will trigger 10k
events in `TicketFoo` and `TicketMaster`

### Demo:

![Demo](./asciinema.svg)
