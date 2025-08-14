import { FastifyInstance } from "fastify";

import registerRoute from "./register.js";
import logoutRoute from "./logout.js";
import updateProfileRoute from "./updateProfile.js";
import getUserRoute from "./getUser.js";

export default async function registerAllRoutes(app: FastifyInstance) {
	await app.register(registerRoute);
	await app.register(logoutRoute);
	await app.register(updateProfileRoute);
	await app.register(getUserRoute);
}