import 'fastify';
import type { FastifyInstance } from 'fastify';
import { Database } from 'better-sqlite3'
import { makeUsersClient } from '../auth.internal';
import '@fastify/jwt'

async function usersClientPlugin(app: FastifyInstance) {
	app.decorate('usersClient', makeUsersClient(app));
}

declare module 'fastify' {
	interface FastifyInstance {
		db: Database;
		usersClient: usersClient;
	}
}

export interface registerBody {
	email: string;
	password : string;
}

export interface authUser {
	userId: string;
	email: string;
	password: string;
	hashedPassword: string;
}

export interface verify2FA {
	userId: string;
	code: string;
}

declare module '@fastify/jwt' {
	interface FastifyJWT {
		payload: { sub: string; jti?: string }
		user: { sub: string; jti?: string }
	}
}

declare module 'fastify' {
	interface FastifyRequest {
		accessJwtVerify: <T = unknown>(opts?: { onlyCookie?: boolean }) => Promise<T>
		refreshJwtVerify: <T = unknown>(opts?: { onlyCookie?: boolean }) => Promise<T>
	}
	interface FastifyReply {
		accessJwtSign(payload: { sub: string }): Promise<string>;
		refreshJwtSign(payload: { sub: string; jti: string }): Promise<string>;
	}
	interface FastifyInstance {
		authenticate: (this: FastifyInstance, req: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}
}