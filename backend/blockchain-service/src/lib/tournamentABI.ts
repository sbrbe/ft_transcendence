const abi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "lineTournament",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "lineRound",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "lineScores",
				"type": "string"
			}
		],
		"name": "MatchInfo",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "lineTournament",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "lineWinner",
				"type": "string"
			}
		],
		"name": "TournamentInfo",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "tournamentId",
				"type": "string"
			},
			{
				"components": [
					{
						"components": [
							{
								"internalType": "string",
								"name": "name",
								"type": "string"
							},
							{
								"internalType": "uint256",
								"name": "score",
								"type": "uint256"
							}
						],
						"internalType": "struct TournamentSummary.PlayerData",
						"name": "player1",
						"type": "tuple"
					},
					{
						"components": [
							{
								"internalType": "string",
								"name": "name",
								"type": "string"
							},
							{
								"internalType": "uint256",
								"name": "score",
								"type": "uint256"
							}
						],
						"internalType": "struct TournamentSummary.PlayerData",
						"name": "player2",
						"type": "tuple"
					}
				],
				"internalType": "struct TournamentSummary.MatchData[]",
				"name": "matches",
				"type": "tuple[]"
			},
			{
				"internalType": "string",
				"name": "winnerName",
				"type": "string"
			}
		],
		"name": "recordTournamentSummary",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
] as const;

export default abi;