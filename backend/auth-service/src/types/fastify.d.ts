import 'fastify'
import { Database } from 'better-sqlite3'

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }
}

export interface registerBody {
	email: string;
	password : string;
}

export interface authUser {
  user_id: string;
  email: string;
  password: string;
  hashed_password: string;
}