import "dotenv/config";
import { ethers } from "ethers";
import abi from "./tournamentABI.js";

const RPC = process.env.FUJI_RPC!;
const CONTRACT_ADDR = process.env.CONTRACT_ADDR!;
const KEEPER_PK = process.env.KEEPER_PK!;

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

export type TSPlayer = { name: string; score: number };
export type TSMatch  = { round: number; player1: TSPlayer; player2: TSPlayer; };
export type TSSummary = { tournamentId: number; winnerName: string; matches: TSMatch[]; };

export async function sendTournamentSummary( s: TSSummary): Promise<{ txHash: string; blockNumber: number; snowtraceTx: string }>
{
  const c = getContract();

  const matchesForAbi = s.matches.map((m) => ({
    round: m.round,
    player1: { name: m.player1.name, score: BigInt(m.player1.score) },
    player2: { name: m.player2.name, score: BigInt(m.player2.score) },
  }));

  const tx = await c.recordTournamentSummary(BigInt(s.tournamentId),matchesForAbi,s.winnerName);
  const rc = await tx.wait();

  return{
    txHash: tx.hash,
    blockNumber: rc?.blockNumber ?? 0,
    snowtraceTx: `https://testnet.snowtrace.io/tx/${tx.hash}/eventlog`,
  };
}
