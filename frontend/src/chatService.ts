import {
	HubConnection,
	HubConnectionBuilder,
	LogLevel,
	HttpTransportType,
} from '@microsoft/signalr'
import { ChatMessage } from './types'

const CHAT_HUB_URL = process.env.REACT_APP_API_URL
	? `${process.env.REACT_APP_API_URL}/chathub`
	: process.env.NODE_ENV === 'production'
	? 'https://test-api.stor8.cloud/chathub'
	: 'http://localhost:5123/chathub'

class ChatService {
	private connection: HubConnection | null = null
	private messageHandlers: ((message: ChatMessage) => void)[] = []
	private userJoinedHandlers: ((username: string) => void)[] = []
	private userLeftHandlers: ((username: string) => void)[] = []

	async connect(token: string): Promise<void> {
		if (this.connection) {
			await this.disconnect()
		}

		this.connection = new HubConnectionBuilder()
			.withUrl(CHAT_HUB_URL, {
				accessTokenFactory: () => token,
				transport:
					HttpTransportType.ServerSentEvents | HttpTransportType.LongPolling, // Fallback transports when WebSockets are blocked
			})
			.withAutomaticReconnect()
			.configureLogging(LogLevel.Information)
			.build()

		// Set up event handlers
		this.connection.on('ReceiveMessage', (username: string, content: string, timestamp: string) => {
			const message: ChatMessage = {
				id: Date.now(), // Generate a simple numeric ID
				content,
				senderUsername: username,
				senderId: 0, // We don't have sender ID from backend, using placeholder
				timestamp
			}
			this.messageHandlers.forEach((handler) => handler(message))
		})

		this.connection.on('UserJoined', (username: string) => {
			this.userJoinedHandlers.forEach((handler) => handler(username))
		})

		this.connection.on('UserLeft', (username: string) => {
			this.userLeftHandlers.forEach((handler) => handler(username))
		})

		try {
			console.log('Attempting to connect to chat hub...')
			await this.connection.start()
			console.log('Connected to chat hub successfully!')
			console.log('Connection state:', this.connection.state)
		} catch (error) {
			console.error('Error connecting to chat hub:', error)
			console.log('Trying alternative connection method...')

			// Try with different transport if WebSocket fails
			try {
				if (this.connection) {
					await this.connection.stop()
				}

				this.connection = new HubConnectionBuilder()
					.withUrl(CHAT_HUB_URL, {
						accessTokenFactory: () => token,
						transport: HttpTransportType.LongPolling, // Fallback to long polling only
					})
					.withAutomaticReconnect()
					.configureLogging(LogLevel.Information)
					.build()

				// Re-setup event handlers
				this.connection.on('ReceiveMessage', (username: string, content: string, timestamp: string) => {
					const message: ChatMessage = {
						id: Date.now(), // Generate a simple numeric ID
						content,
						senderUsername: username,
						senderId: 0, // We don't have sender ID from backend, using placeholder
						timestamp
					}
					this.messageHandlers.forEach((handler) => handler(message))
				})

				this.connection.on('UserJoined', (username: string) => {
					this.userJoinedHandlers.forEach((handler) => handler(username))
				})

				this.connection.on('UserLeft', (username: string) => {
					this.userLeftHandlers.forEach((handler) => handler(username))
				})

				await this.connection.start()
				console.log('Connected to chat hub using Long Polling fallback!')
			} catch (fallbackError) {
				console.error(
					'Failed to connect even with fallback transport:',
					fallbackError
				)
				throw fallbackError
			}
		}
	}

	async disconnect(): Promise<void> {
		if (this.connection) {
			await this.connection.stop()
			this.connection = null
			console.log('Disconnected from chat hub')
		}
	}

	async joinRoom(roomId: string): Promise<void> {
		if (this.connection) {
			await this.connection.invoke('JoinRoom', roomId)
		}
	}

	async leaveRoom(roomId: string): Promise<void> {
		if (this.connection) {
			await this.connection.invoke('LeaveRoom', roomId)
		}
	}

	async sendMessage(content: string, roomId: string): Promise<void> {
		if (this.connection) {
			console.log('Sending message:', { content, roomId })
			await this.connection.invoke('SendMessageToRoom', roomId, content)
		}
	}

	onMessageReceived(handler: (message: ChatMessage) => void): () => void {
		this.messageHandlers.push(handler)
		return () => {
			const index = this.messageHandlers.indexOf(handler)
			if (index > -1) {
				this.messageHandlers.splice(index, 1)
			}
		}
	}

	onUserJoined(handler: (username: string) => void): () => void {
		this.userJoinedHandlers.push(handler)
		return () => {
			const index = this.userJoinedHandlers.indexOf(handler)
			if (index > -1) {
				this.userJoinedHandlers.splice(index, 1)
			}
		}
	}

	onUserLeft(handler: (username: string) => void): () => void {
		this.userLeftHandlers.push(handler)
		return () => {
			const index = this.userLeftHandlers.indexOf(handler)
			if (index > -1) {
				this.userLeftHandlers.splice(index, 1)
			}
		}
	}

	get isConnected(): boolean {
		return this.connection?.state === 'Connected'
	}
}

export const chatService = new ChatService()
