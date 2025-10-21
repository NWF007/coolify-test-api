import axios from 'axios'
import { LoginRequest, LoginResponse, User } from './types'

const API_BASE_URL =
	process.env.REACT_APP_API_URL ||
	(process.env.NODE_ENV === 'production'
		? 'https://test-api.stor8.cloud'
		: 'http://localhost:5123')

// Create axios instance
const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
})

// Add auth token to requests
api.interceptors.request.use((config) => {
	const token = localStorage.getItem('authToken')
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

// Handle auth errors
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Don't auto-redirect if this is during the login flow or /me endpoint call
			const isLoginFlow =
				error.config?.url?.includes('/login') ||
				error.config?.url?.includes('/me')

			if (!isLoginFlow) {
				localStorage.removeItem('authToken')
				localStorage.removeItem('currentUser')
				window.location.href = '/login'
			}
		}
		return Promise.reject(error)
	}
)

export const authApi = {
	login: async (credentials: LoginRequest): Promise<LoginResponse> => {
		const response = await api.post<LoginResponse>('/login', credentials)
		return response.data
	},

	getCurrentUser: async (): Promise<User> => {
		const response = await api.get<User>('/me')
		return response.data
	},
}

export const usersApi = {
	getAll: async (): Promise<User[]> => {
		const response = await api.get<User[]>('/users')
		return response.data
	},
}

export const healthApi = {
	check: async () => {
		const response = await api.get('/health')
		return response.data
	},
}

export default api
