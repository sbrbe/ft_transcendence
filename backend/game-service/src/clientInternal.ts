import fs from 'node:fs';
import fetch from 'node-fetch';
import https from 'https';
import { Payload } from './wssServer.js';

interface DataBlockchain {
	tournamentId: string,
	userId: string,
	winnerName: string,
	matches: Payload[]
}

const agent = new https.Agent({
	ca: fs.readFileSync('/run/certs/ca.crt'),
	cert: fs.readFileSync('/run/certs/game-service.crt'),
	key: fs.readFileSync('/run/certs/game-service.key'),
	rejectUnauthorized: true
});

export async function sendTournamentData(body: DataBlockchain) {
	const res = await fetch(`https://nginx:4443/internal/blockchain/tournaments/summary`, {
		method: 'POST',
		agent,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ body	}),
	});

	let data: any = null;
	data = await res.json();

	if (!res.ok) {
		throw new Error(`sendTournamentData: ${data.error || res.statusText}`);
	}
	console.log('Tournament data send to blockchain-service');
}