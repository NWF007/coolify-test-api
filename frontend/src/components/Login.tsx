import React, { useState } from 'react'
import { useAuth } from '../AuthContext'
import { LoginRequest } from '../types'

const Login: React.FC = () => {
	const [credentials, setCredentials] = useState<LoginRequest>({
		username: '',
		password: '',
	})
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const { login } = useAuth()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!credentials.username || !credentials.password) {
			setError('Please fill in all fields')
			return
		}

		setIsLoading(true)
		setError('')

		try {
			await login(credentials)
		} catch (error: any) {
			setError(
				error.response?.data?.message ||
					'Login failed. Please check your credentials.'
			)
		} finally {
			setIsLoading(false)
		}
	}

	const handleTestLogin = (username: string, password: string) => {
		setCredentials({ username, password })
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
			<div className='max-w-md w-full'>
				<div className='bg-white rounded-2xl shadow-xl p-8'>
					<div className='text-center mb-8'>
						<h1 className='text-3xl font-bold text-gray-900 mb-2'>
							Welcome to Chat App
						</h1>
						<p className='text-gray-600'>Sign in to start chatting</p>
					</div>

					{error && (
						<div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
							<p className='text-red-600 text-sm'>{error}</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className='space-y-6'>
						<div>
							<label
								htmlFor='username'
								className='block text-sm font-medium text-gray-700 mb-2'>
								Username
							</label>
							<input
								id='username'
								type='text'
								value={credentials.username}
								onChange={(e) =>
									setCredentials({ ...credentials, username: e.target.value })
								}
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors'
								placeholder='Enter your username'
								disabled={isLoading}
							/>
						</div>

						<div>
							<label
								htmlFor='password'
								className='block text-sm font-medium text-gray-700 mb-2'>
								Password
							</label>
							<input
								id='password'
								type='password'
								value={credentials.password}
								onChange={(e) =>
									setCredentials({ ...credentials, password: e.target.value })
								}
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors'
								placeholder='Enter your password'
								disabled={isLoading}
							/>
						</div>

						<button
							type='submit'
							disabled={isLoading}
							className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium'>
							{isLoading ? 'Signing in...' : 'Sign In'}
						</button>
					</form>

					<div className='mt-8 pt-6 border-t border-gray-200'>
						<p className='text-sm text-gray-600 mb-4 text-center'>
							Test Accounts:
						</p>
						<div className='grid grid-cols-2 gap-3'>
							<button
								onClick={() => handleTestLogin('alice', 'password123')}
								className='px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium'
								disabled={isLoading}>
								Login as Alice
							</button>
							<button
								onClick={() => handleTestLogin('bob', 'password456')}
								className='px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium'
								disabled={isLoading}>
								Login as Bob
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Login
