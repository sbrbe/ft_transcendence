import { FastifyRequest, FastifyReply } from "fastify";
import { getUserByUsername, getUserById, getFriendship } from './utils.js';
import { User } from "../types/fastify.js";
import { db } from "../init_db.js";

interface RequestForm {
	userId: string;
	friendUsername: string;
}

interface UtilsForm {
	userId: string;
	targetName: string;
}

export interface PendingRequest {
	id: string;
	userId: string;
	friendId: string;
	avatarPath: string;
}

export async function sendFriendRequest(
	req: FastifyRequest<{ Body: RequestForm }>,
	reply: FastifyReply) {
		const { userId, friendUsername } = req.body;
		try {
			const existingFriend = getUserByUsername(friendUsername);
			if (!existingFriend) {
				return reply.status(404).send({ error: 'Player not found: ', friendUsername });
			}
			const existingUser = getUserById(userId);
			if (!existingUser) {
				return reply.status(404).send({ error: 'User not found' });
			}
			await createRequest(existingUser, existingFriend);
			return reply.status(201).send({ message: 'Invite sent !'});
		} catch (error: any) {
			return reply.status(500).send({ error: error.message });
		}
}

async function createRequest(user: User, friend: User) {
	const existingFriendship = getFriendship(user.userId, friend.userId);
	if (existingFriendship?.status === 'accepted') {
		throw new Error("You're already friend with that player");
	}
	if (existingFriendship?.status === 'pending') {
		throw new Error('Invite already sent');
	}
	if (existingFriendship?.status === 'blocked') {
		throw new Error('This player blocked you');
	}

	const res = db.prepare(`INSERT INTO friendships (userId, friendId, status) VALUES (?, ?, 'pending')`)
		.run(user.userId, friend.userId);
	console.log(`FRIEND REQUEST = ${res.lastInsertRowid}`);
}

export async function acceptRequest(
	req: FastifyRequest<{ Body: { userId: string, requestId: number } }>,
	reply: FastifyReply) {
		const { userId, requestId } = req.body;
		try {
			const request = db.prepare(`SELECT * FROM friendships WHERE id = ? AND friendId = ? AND status = 'pending'`)
			.get(requestId, userId);
			if (!request) {
				return reply.status(404).send('Friend request not found');
			}
			const res = db.prepare(`UPDATE friendships SET status = 'accepted', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`)
			.run(requestId);
			console.log(`ACCEPT REQUEST = ${res.changes}`);
			return reply.status(200).send({ message: 'Friend request accepted' });
		} catch (error: any) {
			return reply.status(500).send({ error: error.message });
		}	
}

export async function rejectRequest(
	req: FastifyRequest<{ Body: { userId: string, requestId: number } }>,
	reply: FastifyReply) {
		const { userId, requestId } = req.body;
	try {
		const request = db.prepare(`SELECT * FROM friendships WHERE id = ? AND friendId = ? AND status = 'pending'`)
			.get(requestId, userId);
		if (!request) {
			return reply.status(404).send('Friend request not found');
		}
		const res = db.prepare(`DELETE FROM friendships WHERE id = ?`)
			.run(requestId);
		console.log(`REJECT REQUEST = ${res.changes}`);
		return reply.status(200).send({ message: 'Friend request rejected' });
	} catch (error: any) {
		return reply.status(500).send({ error: error.message });
	}
}

export async function blockUser(
	req: FastifyRequest<{ Body: UtilsForm }>,
	reply: FastifyReply) {
		const { userId, targetName } = req.body;
		try {
			const target = getUserByUsername(targetName);
			if (!target) {
				return reply.status(404).send({ error: 'Player not found' });
			}
			db.prepare(`DELETE FROM friendships WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)`)
				.run(userId, target.userId, target.userId, userId);

			const res = db.prepare(`INSERT INTO friendships (userId, friendId, status) VALUES (?, ?, 'blocked')`)
				.run(userId, target.userId);
			console.log(`BLOCK USER = ${res.lastInsertRowid}`);
			return reply.status(200).send({ message: 'Player blocked' });
		} catch (error: any) {
			return reply.status(500).send({ error: error.message });
		}
}

export async function unblockUser(
	req: FastifyRequest<{ Body: UtilsForm }>,
	reply: FastifyReply) {
		const { userId, targetName } = req.body;

		try {
			const target = getUserByUsername(targetName);
			if (!target) {
				return reply.status(404).send({ error: 'Player not found' });
			}
			const request = getFriendship(userId, target.userId);
			if (!request) {
				return reply.status(400).send({ error: 'Player not blocked' });
			}
			const res = db.prepare(`DELETE FROM friendships WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)`)
				.run(userId, target.userId, target.userId, userId);
			console.log(`UNBLOCK USER = ${res.changes}`);
			return reply.status(200).send({ message: 'Player unblocked' });
		} catch (error: any) {
			return reply.status(500).send({ error: error.message });
		}
}

export async function removeFriend(
	req: FastifyRequest<{ Body: UtilsForm }>,
	reply: FastifyReply) {
		const { userId, targetName } = req.body;

		try {
			const target = getUserByUsername(targetName);
			if (!target) {
				return reply.status(404).send({ error: 'Player not found' });
			}
			const res = db.prepare(`DELETE FROM friendships WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)`)
				.run(userId, target.userId, target.userId, userId);
			if (res.changes === 0){
				return reply.status(404).send({ error: 'Friendship not found '});
			}
			console.log(`REMOVE USER = ${res.changes}`);
			return reply.status(200).send({ message: 'Player removed from friends list'});
		} catch (error: any) {
			return reply.status(500).send({ error: error.message });
		}
}

export async function getPendingRequest(
	req: FastifyRequest<{ Params: { userId: string } }>,
	reply: FastifyReply) {
		const { userId } = req.params;
	console.log('typeof userId =', typeof userId, 'value =', userId);
		try {
			const stmt = db.prepare(`
				SELECT f.id, u.userId, u.username, u.avatarPath
				FROM friendships f
				JOIN users u ON u.userId = f.userId
				WHERE f.friendId = ? and f.status = ?
				ORDER BY f.createdAt DESC
				`);
			const requests = stmt.all(userId, 'pending') as PendingRequest[];
			return reply.status(200).send(requests);
		} catch (error: any) {
			return reply.status(500).send({ error: error.message });
		}
}