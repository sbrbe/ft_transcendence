import Fastify from 'fastify';
import { WebSocketServer, WebSocket } from 'ws';

const fastify = Fastify();
const port = 3004;

interface Client {
  id: string;
  socket: WebSocket;
  blocked: Set<string>;
}

const clients = new Map<WebSocket, Client>();

const wss = new WebSocketServer({ noServer: true });

fastify.server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', (socket) => {
  const client: Client = {
    id: `user_${Math.floor(Math.random() * 1000)}`,
    socket,
    blocked: new Set()
  };
  clients.set(socket, client);

  socket.send(JSON.stringify({ type: 'id', id: client.id }));

  socket.on('message', (data) => {
    const event = JSON.parse(data.toString());

    if (event.type === 'msg') {
      if (event.to === client.id) {
        console.log(`❌ ${client.id} tried to message themselves`);
        return;
      }

      const target = Array.from(clients.values()).find(c => c.id === event.to);
      if (target && !target.blocked.has(client.id)) {
        target.socket.send(JSON.stringify({
          from: client.id,
          msg: event.msg
        }));
      }
    }

    if (event.type === 'block') {
      client.blocked.add(event.block);
      console.log(`🚫 ${client.id} blocked ${event.block}`);
    }

    if (event.type === 'invite') {
      const target = Array.from(clients.values()).find(c => c.id === event.to);
      if (target) {
        target.socket.send(JSON.stringify({
          from: client.id,
          invite: 'pong'
        }));
      }
    }

    if (event.type === 'accept') {
      const target = Array.from(clients.values()).find(c => c.id === event.to);
      if (target) {
        target.socket.send(JSON.stringify({
          from: client.id,
          accept: true
        }));
      }
    }

    if (event.type === 'decline') {
      const target = Array.from(clients.values()).find(c => c.id === event.to);
      if (target) {
        target.socket.send(JSON.stringify({
          from: client.id,
          decline: true
        }));
      }
    }

    if (event.type === 'profile') {
      socket.send(JSON.stringify({
        profileOf: event.user,
        link: `/profile/${event.user}`
      }));
    }
  });

  socket.on('close', () => {
    clients.delete(socket);
    console.log(`❌ Client ${client.id} disconnected.`);
  });

  console.log(`✅ Client ${client.id} connected to WS.`);
});

fastify.listen({ port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`✅ HTTP + WS server listening at ${address}`);
});

