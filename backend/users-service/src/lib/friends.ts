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
	friendUsername: string;
}

export interface FriendsRequest {
	id: number;
	friendId: string;
	friendUsername: string;
	friendAvatarPath: string;
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
		return reply.status(200).send({ message: 'Friend request rejected' });
	} catch (error: any) {
		return reply.status(500).send({ error: error.message });
	}
}

export async function removeFriend(
	req: FastifyRequest<{ Body: UtilsForm }>,
	reply: FastifyReply) {
		const { userId, friendUsername } = req.body;

		try {
			const target = getUserByUsername(friendUsername);
			if (!target) {
				return reply.status(200).send({ message: 'Player removed from friends list'});
			}
			const res = db.prepare(`DELETE FROM friendships WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)`)
				.run(userId, target.userId, target.userId, userId);
			if (res.changes === 0){
				return reply.status(404).send({ error: 'Friendship not found '});
			}
			return reply.status(200).send({ message: 'Player removed from friends list'});
		} catch (error: any) {
			return reply.status(500).send({ error: error.message });
		}
}

export async function getPendingRequest(
	req: FastifyRequest<{ Params: { userId: string } }>,
	reply: FastifyReply) {
		const { userId } = req.params;
		try {
			const stmt = db.prepare(`
				SELECT
					f.id AS id,
					u.userId AS friendId,
					u.username AS friendUsername,
					u.avatarPath AS friendAvatarPath
				FROM friendships f
				JOIN users u ON u.userId = f.userId
				WHERE f.friendId = ? and f.status = ?
				ORDER BY f.createdAt DESC
				`);
			const requests = stmt.all(userId, 'pending') as FriendsRequest[];
			return reply.status(200).send(requests);
		} catch (error: any) {
			return reply.status(500).send({ error: error.message });
		}
}

export async function getFriendsList(
	req: FastifyRequest<{ Params: { userId: string }}>,
	reply: FastifyReply) {
		const { userId } = req.params;
		try {
			const stmt = db.prepare(`
				SELECT
					f.id AS id,
					CASE WHEN f.userId = ? THEN f.friendId ELSE f.userId END AS friendId,
					u.username AS friendUsername,
					u.avatarPath AS friendAvatarPath,
					u.isOnline AS isOnline
				FROM friendships f
				JOIN users u
					ON u.userId = CASE WHEN f.userId = ? THEN f.friendId ELSE f.userId END
				WHERE (f.friendId = ? OR f.userId = ?)
				AND f.status = ?
				ORDER BY f.createdAt DESC
				`);
			const list = stmt.all(userId, userId, userId, userId, 'accepted') as FriendsRequest[];
			return reply.status(200).send(list);
		} catch (error: any) {
			return reply.status(500).send({ error: error.message });
		}
}
