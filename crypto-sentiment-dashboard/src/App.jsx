import { useState, useEffect } from 'react';
import './App.css';

function App() {
	const [cryptoData, setCryptoData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [symbol, setSymbol] = useState('btc');
	const [inputError, setInputError] = useState('');

	const fetchCryptoData = async (crypto) => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/sentiment/${crypto}`);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to fetch data');
			}

			setCryptoData(data);
		} catch (err) {
			setError(err.message);
			setCryptoData(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCryptoData(symbol);
	}, [symbol]);

	const validateInput = (input) => {
		// Remove any non-letter characters and convert to lowercase
		const cleaned = input.replace(/[^A-Za-z]/g, '').toLowerCase();

		if (cleaned.length === 0) {
			return { isValid: false, error: 'Please enter a crypto symbol' };
		}

		if (cleaned.length < 2) {
			return { isValid: false, error: 'Symbol must be at least 2 letters' };
		}

		if (cleaned.length > 10) {
			return { isValid: false, error: 'Symbol must be 10 letters or less' };
		}

		return { isValid: true, cleaned };
	};

	const handleSearch = (e) => {
		e.preventDefault();
		const input = e.target.crypto.value;
		const validation = validateInput(input);

		if (!validation.isValid) {
			setInputError(validation.error);
			return;
		}

		setInputError('');
		setSymbol(validation.cleaned);
		e.target.crypto.value = validation.cleaned.toUpperCase();
	};

	const handleInputChange = (e) => {
		const input = e.target.value;
		const validation = validateInput(input);

		if (validation.isValid) {
			setInputError('');
			e.target.value = validation.cleaned.toUpperCase();
		} else if (input.length > 0) {
			setInputError(validation.error);
		} else {
			setInputError('');
		}
	};

	return (
		<div className='app'>
			<header className='app-header'>
				<h1>🚀 Crypto Sentiment Dashboard</h1>
				<p>Real-time cryptocurrency sentiment analysis powered by LunarCrush</p>
			</header>

			{/* Mock Data Banner */}
			{cryptoData && cryptoData.isMockData && (
				<div className='mock-data-banner'>
					<div className='banner-content'>
						<span className='banner-icon'>⚠️</span>
						<div>
							<strong>Demo Mode:</strong> Using mock data for demonstration.
							<br />
							<small>
								Add your LunarCrush API key to see real sentiment data.
							</small>
						</div>
					</div>
				</div>
			)}

			<form onSubmit={handleSearch} className='search-form'>
				<div className='input-container'>
					<input
						name='crypto'
						type='text'
						placeholder='Enter crypto symbol (e.g., BTC, ETH)'
						defaultValue={symbol.toUpperCase()}
						onChange={handleInputChange}
						maxLength={10}
						pattern='[A-Za-z]*'
						className={inputError ? 'input-error' : ''}
					/>
					{inputError && (
						<div className='input-error-message'>{inputError}</div>
					)}
				</div>
				<button type='submit' disabled={!!inputError}>
					Get Sentiment
				</button>
			</form>

			{loading && <div className='loading'>Loading sentiment data...</div>}

			{error && <div className='error'>Error: {error}</div>}

			{cryptoData && !loading && (
				<div className='crypto-card'>
					<h2>
						{cryptoData.name} ({cryptoData.symbol})
						{cryptoData.isMockData && <span className='mock-badge'>DEMO</span>}
					</h2>

					<div className='metrics-grid'>
						<div className='metric'>
							<label>Galaxy Score</label>
							<span className='value'>{cryptoData.galaxyScore}</span>
						</div>

						<div className='metric'>
							<label>Alt Rank</label>
							<span className='value'>#{cryptoData.altRank}</span>
						</div>

						<div className='metric'>
							<label>Price</label>
							<span className='value'>
								${cryptoData.price?.toLocaleString()}
							</span>
						</div>

						<div className='metric'>
							<label>24h Change</label>
							<span
								className={`value ${
									cryptoData.priceChange24h >= 0 ? 'positive' : 'negative'
								}`}>
								{cryptoData.priceChange24h?.toFixed(2)}%
							</span>
						</div>

						<div className='metric'>
							<label>Social Volume</label>
							<span className='value'>
								{cryptoData.socialVolume?.toLocaleString()}
							</span>
						</div>
					</div>

					<div className='timestamp'>
						Last updated: {new Date(cryptoData.timestamp).toLocaleString()}
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
