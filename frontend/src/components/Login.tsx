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

	const handleTestLogin = async (username: string, password: string) => {
		const testCredentials = { username, password }
		setCredentials(testCredentials)

		setIsLoading(true)
		setError('')

		try {
			await login(testCredentials)
		} catch (error: any) {
			setError(
				error.response?.data?.message ||
					'Login failed. Please check your credentials.'
			)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-100 flex items-center justify-center p-4'>
			<div className='max-w-md w-full space-y-8 animate-fade-in'>
				<div className='bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden'>
					{/* Background decoration */}
					<div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full -translate-y-16 translate-x-16 opacity-10'></div>
					<div className='absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full translate-y-12 -translate-x-12 opacity-10'></div>

					{/* Header */}
					<div className='text-center mb-8 relative z-10'>
						<div className='w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg'>
							<svg
								className='w-10 h-10 text-white'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
								/>
							</svg>
						</div>
						<h1 className='text-3xl font-bold text-gray-900 mb-2'>
							Welcome to Chat App
						</h1>
						<p className='text-gray-600'>Sign in to start chatting</p>
					</div>

					{/* Error Message */}
					{error && (
						<div className='mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-slide-up'>
							<div className='flex'>
								<div className='flex-shrink-0'>
									<svg
										className='h-5 w-5 text-red-400'
										viewBox='0 0 20 20'
										fill='currentColor'>
										<path
											fillRule='evenodd'
											d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
											clipRule='evenodd'
										/>
									</svg>
								</div>
								<div className='ml-3'>
									<p className='text-sm text-red-700'>{error}</p>
								</div>
							</div>
						</div>
					)}

					{/* Login Form */}
					<form onSubmit={handleSubmit} className='space-y-6 relative z-10'>
						<div>
							<label
								htmlFor='username'
								className='block text-sm font-semibold text-gray-700 mb-2'>
								Username
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<svg
										className='h-5 w-5 text-gray-400'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
										/>
									</svg>
								</div>
								<input
									id='username'
									type='text'
									value={credentials.username}
									onChange={(e) =>
										setCredentials({ ...credentials, username: e.target.value })
									}
									className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/50 hover:bg-white/70 focus:bg-white'
									placeholder='Enter your username'
									disabled={isLoading}
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor='password'
								className='block text-sm font-semibold text-gray-700 mb-2'>
								Password
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<svg
										className='h-5 w-5 text-gray-400'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
										/>
									</svg>
								</div>
								<input
									id='password'
									type='password'
									value={credentials.password}
									onChange={(e) =>
										setCredentials({ ...credentials, password: e.target.value })
									}
									className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/50 hover:bg-white/70 focus:bg-white'
									placeholder='Enter your password'
									disabled={isLoading}
								/>
							</div>
						</div>

						<button
							type='submit'
							disabled={isLoading}
							className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'>
							{isLoading ? (
								<div className='flex items-center justify-center'>
									<svg
										className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'>
										<circle
											className='opacity-25'
											cx='12'
											cy='12'
											r='10'
											stroke='currentColor'
											strokeWidth='4'></circle>
										<path
											className='opacity-75'
											fill='currentColor'
											d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
									</svg>
									Signing in...
								</div>
							) : (
								'Sign In'
							)}
						</button>
					</form>

					{/* Test Accounts */}
					<div className='mt-8 pt-6 border-t border-gray-200 relative z-10'>
						<p className='text-sm text-gray-600 mb-4 text-center font-medium'>
							Test Accounts:
						</p>
						<div className='grid grid-cols-2 gap-3'>
							<button
								onClick={() => handleTestLogin('alice', 'password123')}
								className='group px-4 py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-xl hover:from-purple-200 hover:to-pink-200 transition-all duration-200 text-sm font-semibold border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0'
								disabled={isLoading}>
								<div className='flex items-center justify-center space-x-2'>
									<div className='w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold'>
										A
									</div>
									<span>Alice</span>
								</div>
							</button>
							<button
								onClick={() => handleTestLogin('bob', 'password456')}
								className='group px-4 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-xl hover:from-green-200 hover:to-emerald-200 transition-all duration-200 text-sm font-semibold border border-green-200 hover:border-green-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0'
								disabled={isLoading}>
								<div className='flex items-center justify-center space-x-2'>
									<div className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold'>
										B
									</div>
									<span>Bob</span>
								</div>
							</button>
						</div>
						<p className='text-xs text-gray-500 mt-3 text-center'>
							Click above to quickly login with test credentials
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Login
