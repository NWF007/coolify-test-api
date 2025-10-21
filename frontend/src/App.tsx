import React from 'react'
import { AuthProvider, useAuth } from './AuthContext'
import Login from './components/Login'
import Chat from './components/Chat'
import './App.css'

const AppContent: React.FC = () => {
	const { isAuthenticated, isLoading } = useAuth()

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
					<p className='text-gray-600'>Loading...</p>
				</div>
			</div>
		)
	}

	return isAuthenticated ? <Chat /> : <Login />
}

const App: React.FC = () => {
	return (
		<AuthProvider>
			<AppContent />
		</AuthProvider>
	)
}

export default App
