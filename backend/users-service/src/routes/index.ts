import { FastifyInstance } from "fastify";
import registerRoute from "./register.js";
import updateProfileRoute from "./updateProfile.js";
import getUserRoute from "./getUser.js";
import { avatarUploadRoute } from "./uploadAvatar.js";
import { searchUserRoute } from "./searchUser.js";

export default async function registerAllRoutes(app: FastifyInstance) {
	await app.register(registerRoute);
	await app.register(updateProfileRoute);
	await app.register(getUserRoute);
	await app.register(avatarUploadRoute);
	await app.register(searchUserRoute);
}