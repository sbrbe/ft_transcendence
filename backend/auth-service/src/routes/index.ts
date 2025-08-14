import { FastifyInstance } from "fastify";

import deleteUserRoute from "./deleteUser.js";
import getEmailRoute from "./getEmail.js";
import loginRoute from "./login.js";
import registerRoute from "./register.js";
import updateEmailRoute from "./updateEmail.js";
import updatePasswordRoute from "./updatePassword.js";

export default async function registerAllRoutes(app: FastifyInstance) {
	await app.register(deleteUserRoute);
	await app.register(getEmailRoute);
	await app.register(loginRoute);
	await app.register(registerRoute);
	await app.register(updateEmailRoute);
	await app.register(updatePasswordRoute);
}