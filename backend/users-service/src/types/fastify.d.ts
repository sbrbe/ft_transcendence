import 'fastify'
import { Database } from 'better-sqlite3'

declare module 'fastify' {
	interface FastifyInstance {
		db: Database;
		avatarsDir: string;
	}
}

export interface User {
	userId: string;
	lastName: string;
	firstName: string;
	username: string;
	avatarPath: string;
	isOnline: 0 | 1 | boolean;
	lastLogin: string | number | null;
	createdAt: string | number;
	updatedAt: string | number;
}

export interface UserUpdate {
	lastName?: string;
	firstName?: string;
	username?: string;
	avatarPath?: string;
}

export interface Friend {
	id: number;
	userId: string;
	friendId: string;
	status: 'pending' | 'accepted' | 'blocked';
	createdAt: string | number;
	updatedAt: string | number;
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