import type { FastifyInstance } from 'fastify';
import { Database } from 'better-sqlite3'
import { makeUsersClient } from '../auth.internal';

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