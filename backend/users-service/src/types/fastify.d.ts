import 'fastify'
import { Database } from 'better-sqlite3'

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }
}

export interface User {
  user_id: string;
  last_name: string;
  first_name: string;
  username: string;
  avatar_url: string;
}

export interface UserUpdate {
  last_name?: string;
  first_name?: string;
  username?: string;
  avatar_url?: string;
}