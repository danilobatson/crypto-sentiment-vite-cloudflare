// api/index.js

// Mock data for demonstration
const MOCK_DATA = {
	btc: {
		symbol: 'BTC',
		name: 'Bitcoin',
		galaxyScore: 75.2,
		altRank: 1,
		socialVolume: 15420,
		price: 104567.89,
		priceChange24h: -2.14,
		timestamp: new Date().toISOString(),
	},
	eth: {
		symbol: 'ETH',
		name: 'Ethereum',
		galaxyScore: 68.5,
		altRank: 2,
		socialVolume: 12890,
		price: 3840.23,
		priceChange24h: 1.87,
		timestamp: new Date().toISOString(),
	},
	sol: {
		symbol: 'SOL',
		name: 'Solana',
		galaxyScore: 62.1,
		altRank: 5,
		socialVolume: 8750,
		price: 248.67,
		priceChange24h: 4.32,
		timestamp: new Date().toISOString(),
	},
	ada: {
		symbol: 'ADA',
		name: 'Cardano',
		galaxyScore: 45.8,
		altRank: 12,
		socialVolume: 4200,
		price: 1.23,
		priceChange24h: -0.95,
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
		galaxyScore: Math.round((Math.random() * 80 + 10) * 10) / 10,
		altRank: Math.floor(Math.random() * 500) + 1,
		socialVolume: Math.floor(Math.random() * 10000),
		price: Math.round((Math.random() * 1000 + 0.01) * 100) / 100,
		priceChange24h: Math.round((Math.random() * 20 - 10) * 100) / 100,
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

		// Health check endpoint
		if (url.pathname === '/api/health') {
			return new Response(
				JSON.stringify({
					status: 'healthy',
					timestamp: new Date().toISOString(),
					hasApiKey: !!env.LUNARCRUSH_API_KEY,
				}),
				{
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				}
			);
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
						'Cache-Control': 'public, max-age=60', // Shorter cache for mock data
					},
				});
			}

			try {
				// Try real API call
				const response = await fetch(
					`https://lunarcrush.com/api4/public/coins/${symbol.toLowerCase()}/v1`,
					{
						headers: {
							Authorization: `Bearer ${env.LUNARCRUSH_API_KEY}`,
						},
					}
				);

				// If unauthorized or API key invalid, fall back to mock data
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

				if (!response.ok) {
					throw new Error(`LunarCrush API error: ${response.status}`);
				}

				const data = await response.json();

				// Check if symbol exists in API
				if (!data.data) {
					return new Response(
						JSON.stringify({
							error: 'Symbol not found',
							message: `Cryptocurrency symbol '${symbol.toUpperCase()}' not found. Try BTC, ETH, SOL, ADA, etc.`,
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
					galaxyScore: coinData.galaxy_score || 0,
					altRank: coinData.alt_rank || 0,
					socialVolume: coinData.social_volume_24h || 0,
					price: coinData.price || 0,
					priceChange24h: coinData.percent_change_24h || 0,
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
			} catch (error) {
				console.log('API call failed, using mock data:', error.message);
				// Fall back to mock data on any error
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

		// Serve static assets for everything else
		return env.ASSETS.fetch(request);
	},
};
