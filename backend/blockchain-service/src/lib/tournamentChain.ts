import "dotenv/config";
import { ethers } from "ethers";
import abi from "./tournamentABI.js";

const RPC = process.env.FUJI_RPC!;
const CONTRACT_ADDR = process.env.CONTRACT_ADDR!;
const KEEPER_PK = process.env.KEEPER_PK!;

if (!process.env.FUJI_RPC || !process.env.CONTRACT_ADDR || !process.env.KEEPER_PK) {
	throw new Error('FUJI_RPC, CONTRACT_ADDR or KEEPER_PK not set');
}

type Payload = {
  player1: { name: string; score: number };
  player2: { name: string; score: number };
};
let _contract: ethers.Contract | null = null;


function getContract(): ethers.Contract
{
  if (_contract) 
    return (_contract);
  if (!RPC || !CONTRACT_ADDR || !KEEPER_PK)
    throw new Error("Missing env: FUJI_RPC / CONTRACT_ADDR / KEEPER_PK");
  const provider = new ethers.JsonRpcProvider(RPC);
  const signer = new ethers.Wallet(KEEPER_PK, provider);
  _contract = new ethers.Contract(CONTRACT_ADDR, abi as ethers.InterfaceAbi, signer);
  return (_contract);
}

export type TSSummary = { tournamentId: string; userId: string; winnerName: string; matches: Payload[] };

export function addPlayers(matches: Payload[]): string[]
{
  const playerNumber = matches.length + 1;
  const roundSize = playerNumber / 2;
  const playerArr: string[] = [];
  
  for (let i = 0; i < roundSize; i++)
  {
    const match = matches[i];
    playerArr.push(match.player1.name, match.player2.name);
  }
  return playerArr.slice(0, playerNumber);
}

export async function sendTournamentSummary( s: TSSummary): Promise<{ txHash: string; blockNumber: number; snowtraceTx: string }>
{
  const c = getContract();

  const matchesForAbi = s.matches.map((m) => ({
    player1: { name: m.player1.name, score: BigInt(m.player1.score) },
    player2: { name: m.player2.name, score: BigInt(m.player2.score) },
  }));
  const tx = await c.recordTournamentSummary( s.tournamentId, matchesForAbi, s.winnerName );
  const rc = await tx.wait();

  return{
    txHash: tx.hash,
    blockNumber: rc?.blockNumber ?? 0,
    snowtraceTx: `https://testnet.snowtrace.io/tx/${tx.hash}/eventlog`,
  };
}
