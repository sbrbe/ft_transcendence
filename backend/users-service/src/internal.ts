import type { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { TLSSocket } from 'node:tls';

function toTlsSocket(socket: unknown): TLSSocket | null {
	const sock = socket as TLSSocket | undefined;
	if (!sock)
		return null;
	return typeof (sock as any).getPeerCertificate === 'function' ? (sock as TLSSocket): null;
}

function requireNginxAndCaller(allowedCallers: string[]) {
	return async (req: FastifyRequest, reply: FastifyReply) => {
		const tls = toTlsSocket(req.raw.socket);

		if (!tls) {
			return reply.status(401).send({ error: 'mTLS required : client cert not authorized' });
		}
		if (!tls.authorized) {
			return reply.status(401).send({ error: 'mTLS required '});
		}
		const peer = tls.getPeerCertificate();
		if (!peer || !peer.subject?.CN) {
			return reply.status(403).send({ error: 'TLS peer not allowed' });
		}
		const callerCN = String(req.headers['x-caller-cn'] || '');
		if (!allowedCallers.includes(callerCN)) {
			return reply.status(403).send({ error: 'Caller CN not allowed' });
		}
	};
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type InternalRoute = {
	method: HttpMethod;
	url: string;
	opts?: RouteShorthandOptions;
	handler: (req: FastifyRequest, reply: FastifyReply) => unknown | Promise<unknown>;
	allowedCallers?: string[];
}

export function registerInternal(
	app: FastifyInstance,
	params: {
		prefix: string;
		allowedCallers: string[];
		routes: InternalRoute[];
	}
) {
	const { prefix, allowedCallers, routes } = params;

	app.register(async (r) => {
	//	r.addHook('onRequest', requireNginxAndCaller(allowedCallers));

		for (const route of routes) {
			if (route.allowedCallers && route.allowedCallers.length) {
				r.route({
					method: route.method,
					url: route.url,
					...route.opts,
			//		onRequest: [requireNginxAndCaller(route.allowedCallers)],
					handler: route.handler,
				});
			} else {
				r.route({
					method: route.method,
					url: route.url,
					...route.opts,
					handler: route.handler,
				});
			}
		}
	}, { prefix });
}