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