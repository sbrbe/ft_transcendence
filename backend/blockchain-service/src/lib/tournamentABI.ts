const abi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "line",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "line2",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "line3",
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
				"name": "line4",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "line5",
				"type": "string"
			}
		],
		"name": "TournamentInfo",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tournamentId",
				"type": "uint256"
			},
			{
				"components": [
					{
						"internalType": "enum TournamentSummary.Round",
						"name": "round",
						"type": "uint8"
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