import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from 'react'
import { User, LoginRequest } from './types'
import { authApi } from './api'

interface AuthContextType {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	login: (credentials: LoginRequest) => Promise<void>
	logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}

interface AuthProviderProps {
	children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const initAuth = async () => {
			const token = localStorage.getItem('authToken')
			const savedUser = localStorage.getItem('currentUser')

			if (token && savedUser) {
				try {
					const currentUser = await authApi.getCurrentUser()
					setUser(currentUser)
				} catch (error) {
					console.error('Failed to get current user:', error)
					localStorage.removeItem('authToken')
					localStorage.removeItem('currentUser')
				}
			}
			setIsLoading(false)
		}

		initAuth()
	}, [])

	const login = async (credentials: LoginRequest) => {
		try {
			console.log('Starting login process...')
			const response = await authApi.login(credentials)
			console.log('Login API response:', response)

			localStorage.setItem('authToken', response.token)

			// Create user object from login response
			const userFromLogin = {
				id: response.userId,
				username: response.username,
				email: '', // We'll try to get this from /me, but it's not critical
			}

			localStorage.setItem('currentUser', JSON.stringify(userFromLogin))

			// Try to get full user info, but don't fail if it doesn't work
			try {
				console.log('Getting current user from /me endpoint...')
				const currentUser = await authApi.getCurrentUser()
				console.log('Current user from /me:', currentUser)
				setUser(currentUser)
			} catch (meError) {
				console.warn(
					'Failed to get user from /me endpoint, using login response data:',
					meError
				)
				// Use the data from login response if /me fails
				setUser(userFromLogin)
			}

			console.log('User state updated, isAuthenticated should be true')
		} catch (error) {
			console.error('Login error:', error)
			throw error
		}
	}

	const logout = () => {
		localStorage.removeItem('authToken')
		localStorage.removeItem('currentUser')
		setUser(null)
	}

	const value = {
		user,
		isAuthenticated: !!user,
		isLoading,
		login,
		logout,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
