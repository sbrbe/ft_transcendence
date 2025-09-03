import "fastify";
import { Database } from "better-sqlite3";

declare module 'fastify'
{
	interface FastifyInstance {
		db: Database;
	}
}

export type tournoiValues = {
	tournoiId: string;
	snowtrace_link: string;
};

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