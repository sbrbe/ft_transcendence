import fs from 'node:fs';
import fetch from 'node-fetch';
import https from 'https';

const agent = new https.Agent({
	ca: fs.readFileSync('/run/certs/ca.crt'),
	cert: fs.readFileSync('/run/certs/auth-service.crt'),
	key: fs.readFileSync('/run/certs/auth-service.key'),
	rejectUnauthorized: true
});

export async function setOnlineStatus(userId: string, online: boolean) {
	const res = await fetch(`https://nginx:4443/internal/users/status`, {
		method: 'PUT',
		agent,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ userId, online }),
	});

	let data: any = null;
	data = await res.json();

	if (!res.ok) {
		throw new Error(`SetOnlineStatus: ${data.error || res.statusText}`);
	}
	console.log('Online status updated');
}