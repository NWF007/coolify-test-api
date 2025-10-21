import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

interface WeatherForecast {
	date: string
	temperatureC: number
	temperatureF: number
	summary: string
}

interface User {
	id: number
	name: string
	email: string
}

interface HealthStatus {
	status: string
	timestamp: string
}

function App() {
	const [weather, setWeather] = useState<WeatherForecast[]>([])
	const [users, setUsers] = useState<User[]>([])
	const [health, setHealth] = useState<HealthStatus | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'

	useEffect(() => {
		fetchData()
	}, [])

	const fetchData = async () => {
		try {
			setLoading(true)
			setError(null)

			const [healthResponse, weatherResponse, usersResponse] =
				await Promise.all([
					axios.get(`${API_BASE_URL}/health`),
					axios.get(`${API_BASE_URL}/weatherforecast`),
					axios.get(`${API_BASE_URL}/users`),
				])

			setHealth(healthResponse.data)
			setWeather(weatherResponse.data)
			setUsers(usersResponse.data)
		} catch (err) {
			setError(
				'Failed to fetch data from API. Make sure the API server is running.'
			)
			console.error('API Error:', err)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='App'>
			<header className='App-header'>
				<h1>Coolify Test Application</h1>
				<p>Simple .NET API + React Frontend for CI/CD Testing</p>

				{loading && <p>Loading...</p>}

				{error && (
					<div
						style={{
							color: 'red',
							background: '#ffebee',
							padding: '10px',
							borderRadius: '4px',
							margin: '10px 0',
						}}>
						<strong>Error:</strong> {error}
						<br />
						<button onClick={fetchData} style={{ marginTop: '10px' }}>
							Retry
						</button>
					</div>
				)}

				{health && (
					<div
						style={{
							background: '#e8f5e8',
							color: '#2e7d32',
							padding: '10px',
							borderRadius: '4px',
							margin: '10px 0',
						}}>
						<strong>API Status:</strong> {health.status} (Last checked:{' '}
						{new Date(health.timestamp).toLocaleString()})
					</div>
				)}

				<div
					style={{
						display: 'flex',
						flexWrap: 'wrap',
						gap: '20px',
						justifyContent: 'center',
						maxWidth: '1200px',
					}}>
					<div
						style={{
							background: '#f5f5f5',
							color: '#333',
							padding: '20px',
							borderRadius: '8px',
							minWidth: '300px',
						}}>
						<h2>Weather Forecast</h2>
						{weather.length > 0 ? (
							<ul style={{ listStyle: 'none', padding: 0 }}>
								{weather.map((item, index) => (
									<li
										key={index}
										style={{
											background: '#fff',
											margin: '5px 0',
											padding: '10px',
											borderRadius: '4px',
										}}>
										<strong>{item.date}</strong>
										<br />
										{item.temperatureC}°C ({item.temperatureF}°F)
										<br />
										{item.summary}
									</li>
								))}
							</ul>
						) : (
							<p>No weather data available</p>
						)}
					</div>

					<div
						style={{
							background: '#f5f5f5',
							color: '#333',
							padding: '20px',
							borderRadius: '8px',
							minWidth: '300px',
						}}>
						<h2>Users</h2>
						{users.length > 0 ? (
							<ul style={{ listStyle: 'none', padding: 0 }}>
								{users.map((user) => (
									<li
										key={user.id}
										style={{
											background: '#fff',
											margin: '5px 0',
											padding: '10px',
											borderRadius: '4px',
										}}>
										<strong>{user.name}</strong>
										<br />
										{user.email}
									</li>
								))}
							</ul>
						) : (
							<p>No users available</p>
						)}
					</div>
				</div>

				<button
					onClick={fetchData}
					style={{
						margin: '20px 10px',
						padding: '10px 20px',
						background: '#61dafb',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer',
						fontSize: '16px',
					}}>
					Refresh Data
				</button>
			</header>
		</div>
	)
}

export default App
