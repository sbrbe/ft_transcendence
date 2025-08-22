import 'fastify'
import { Database } from 'better-sqlite3'

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }
}

export interface User {
  userId: string;
  lastName: string;
  firstName: string;
  username: string;
  avatarUrl: string;
}

export interface UserUpdate {
  lastName?: string;
  firstName?: string;
  username?: string;
  avatarUrl?: string;
}

declare module 'fastify' {
	interface FastifyRequest {
		accessJwtVerify: <T = unknown>(opts?: { onlyCookie?: boolean }) => Promise<T>
	}
	interface FastifyReply {
		accessJwtSign(payload: { sub: string }): Promise<string>;
	}
	interface FastifyInstance {
		authenticate: (this: FastifyInstance, req: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}
}