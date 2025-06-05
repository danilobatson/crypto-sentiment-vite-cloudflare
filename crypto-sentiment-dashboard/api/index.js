// api/index.js

// Mock data for demonstration
const MOCK_DATA = {
	btc: {
		symbol: 'BTC',
		name: 'Bitcoin',
		price: 104080.81,
		galaxyScore: 46.3,
		altRank: 306,
		marketCap: 2068578645007.58,
		volume24h: 41976305116.99,
		percentChange24h: -1.07,
		percentChange7d: -2.54,
		percentChange30d: 7.27,
		volatility: 0.0045,
		marketCapRank: 1,
		timestamp: new Date().toISOString(),
	},
	eth: {
		symbol: 'ETH',
		name: 'Ethereum',
		price: 3840.23,
		galaxyScore: 68.5,
		altRank: 2,
		marketCap: 450000000000,
		volume24h: 15000000000,
		percentChange24h: 1.87,
		percentChange7d: -1.23,
		percentChange30d: 12.45,
		volatility: 0.0067,
		marketCapRank: 2,
		timestamp: new Date().toISOString(),
	},
	sol: {
		symbol: 'SOL',
		name: 'Solana',
		price: 248.67,
		galaxyScore: 62.1,
		altRank: 5,
		marketCap: 118000000000,
		volume24h: 3200000000,
		percentChange24h: 4.32,
		percentChange7d: 8.91,
		percentChange30d: 22.15,
		volatility: 0.0089,
		marketCapRank: 5,
		timestamp: new Date().toISOString(),
	},
	ada: {
		symbol: 'ADA',
		name: 'Cardano',
		price: 1.23,
		galaxyScore: 45.8,
		altRank: 12,
		marketCap: 42000000000,
		volume24h: 890000000,
		percentChange24h: -0.95,
		percentChange7d: 2.14,
		percentChange30d: -3.67,
		volatility: 0.0056,
		marketCapRank: 8,
		timestamp: new Date().toISOString(),
	},
	dot: {
		symbol: 'DOT',
		name: 'Polkadot',
		price: 8.45,
		galaxyScore: 52.3,
		altRank: 18,
		marketCap: 12500000000,
		volume24h: 320000000,
		percentChange24h: 2.67,
		percentChange7d: -1.89,
		percentChange30d: 15.42,
		volatility: 0.0078,
		marketCapRank: 12,
		timestamp: new Date().toISOString(),
	},
};

function getMockData(symbol) {
	const lowerSymbol = symbol.toLowerCase();
	if (MOCK_DATA[lowerSymbol]) {
		return { ...MOCK_DATA[lowerSymbol], isMockData: true };
	}

	// Generate realistic mock data for unknown symbols
	return {
		symbol: symbol.toUpperCase(),
		name: `${symbol.toUpperCase()} Token`,
		price: Math.round((Math.random() * 1000 + 0.01) * 100) / 100,
		galaxyScore: Math.round((Math.random() * 80 + 10) * 10) / 10,
		altRank: Math.floor(Math.random() * 500) + 1,
		marketCap: Math.floor(Math.random() * 100000000000),
		volume24h: Math.floor(Math.random() * 5000000000),
		percentChange24h: Math.round((Math.random() * 20 - 10) * 100) / 100,
		percentChange7d: Math.round((Math.random() * 30 - 15) * 100) / 100,
		percentChange30d: Math.round((Math.random() * 50 - 25) * 100) / 100,
		volatility: Math.round(Math.random() * 0.01 * 10000) / 10000,
		marketCapRank: Math.floor(Math.random() * 1000) + 1,
		timestamp: new Date().toISOString(),
		isMockData: true,
	};
}

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		// Handle CORS
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		// Crypto sentiment endpoint
		if (url.pathname.startsWith('/api/sentiment/')) {
			const symbol = url.pathname.split('/')[3];

			// Validate symbol format (letters only, 2-10 characters)
			if (!symbol || !/^[A-Za-z]{2,10}$/.test(symbol)) {
				return new Response(
					JSON.stringify({
						error: 'Invalid symbol format',
						message: 'Symbol must be 2-10 letters only (e.g., BTC, ETH)',
					}),
					{
						status: 400,
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
					}
				);
			}

			// Check if API key is available
			if (!env.LUNARCRUSH_API_KEY) {
				console.log('No API key available, using mock data');
				const mockData = getMockData(symbol);
				return new Response(JSON.stringify(mockData), {
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
						'Cache-Control': 'public, max-age=60',
					},
				});
			}

			// We have an API key, so try the real API
			try {
				const response = await fetch(
					`https://lunarcrush.com/api4/public/coins/${symbol.toLowerCase()}/v1`,
					{
						headers: {
							Authorization: `Bearer ${env.LUNARCRUSH_API_KEY}`,
						},
					}
				);

				// If unauthorized or forbidden, the API key is invalid
				if (response.status === 401 || response.status === 403) {
					console.log('API key invalid or unauthorized, using mock data');
					const mockData = getMockData(symbol);
					return new Response(JSON.stringify(mockData), {
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
							'Cache-Control': 'public, max-age=60',
						},
					});
				}

				// If we get a successful response from the API
				if (response.ok) {
					const data = await response.json();

					// Check if the coin exists in the API response
					if (!data.data) {
						// Coin doesn't exist - return proper error (don't fall back to mock data)
						return new Response(
							JSON.stringify({
								error: 'Cryptocurrency not found',
								message: `The cryptocurrency "${symbol.toUpperCase()}" was not found. Please check the symbol and try again.`,
								suggestion:
									'Try popular symbols like BTC, ETH, SOL, ADA, MATIC, DOT, etc.',
							}),
							{
								status: 404,
								headers: {
									'Content-Type': 'application/json',
									'Access-Control-Allow-Origin': '*',
								},
							}
						);
					}

					// Format real API response
					const coinData = data.data;
					const formatted = {
						symbol: symbol.toUpperCase(),
						name: coinData.name || 'Unknown',
						price: coinData.price || 0,
						galaxyScore: coinData.galaxy_score || 0,
						altRank: coinData.alt_rank || 0,
						marketCap: coinData.market_cap || 0,
						volume24h: coinData.volume_24h || 0,
						percentChange24h: coinData.percent_change_24h || 0,
						percentChange7d: coinData.percent_change_7d || 0,
						percentChange30d: coinData.percent_change_30d || 0,
						volatility: coinData.volatility || 0,
						marketCapRank: coinData.market_cap_rank || 0,
						timestamp: new Date().toISOString(),
						isMockData: false,
					};

					return new Response(JSON.stringify(formatted), {
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
							'Cache-Control': 'public, max-age=300',
						},
					});
				} else {
					// API returned an error (500, etc.) - this is a server issue, fall back to mock
					console.log(
						'LunarCrush API server error, using mock data:',
						response.status
					);
					const mockData = getMockData(symbol);
					return new Response(JSON.stringify(mockData), {
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
							'Cache-Control': 'public, max-age=60',
						},
					});
				}
			} catch (error) {
				// Network error or other exception - fall back to mock data
				console.log(
					'API call failed due to network/exception, using mock data:',
					error.message
				);
				const mockData = getMockData(symbol);
				return new Response(JSON.stringify(mockData), {
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
						'Cache-Control': 'public, max-age=60',
					},
				});
			}
		}

		// Health check
		if (url.pathname === '/api/health') {
			return new Response(
				JSON.stringify({
					status: 'healthy',
					timestamp: new Date().toISOString(),
				}),
				{
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				}
			);
		}

		// Serve static assets
		return env.ASSETS.fetch(request);
	},
};
