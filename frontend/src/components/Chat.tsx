import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../AuthContext'
import { chatService } from '../chatService'
import { ChatMessage, User } from '../types'
import { usersApi } from '../api'

const Chat: React.FC = () => {
	const { user, logout } = useAuth()
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [newMessage, setNewMessage] = useState('')
	const [isConnected, setIsConnected] = useState(false)
	const [allUsers, setAllUsers] = useState<User[]>([])
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const roomId = 'general' // Using a single room for simplicity

	useEffect(() => {
		const initChat = async () => {
			try {
				const token = localStorage.getItem('authToken')
				if (token) {
					await chatService.connect(token)
					await chatService.joinRoom(roomId)
					setIsConnected(true)
				}

				// Load all users
				const users = await usersApi.getAll()
				setAllUsers(users)
			} catch (error) {
				console.error('Failed to initialize chat:', error)
			}
		}

		initChat()

		// Set up message handler
		const unsubscribeMessage = chatService.onMessageReceived((message) => {
			setMessages((prev) => [...prev, message])
		})

		const unsubscribeUserJoined = chatService.onUserJoined((username) => {
			console.log(`${username} joined the chat`)
		})

		const unsubscribeUserLeft = chatService.onUserLeft((username) => {
			console.log(`${username} left the chat`)
		})

		return () => {
			unsubscribeMessage()
			unsubscribeUserJoined()
			unsubscribeUserLeft()
			chatService.disconnect()
		}
	}, [])

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	const sendMessage = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!newMessage.trim() || !isConnected) return

		try {
			await chatService.sendMessage(newMessage.trim(), roomId)
			setNewMessage('')
		} catch (error) {
			console.error('Failed to send message:', error)
		}
	}

	const formatTime = (timestamp: string) => {
		return new Date(timestamp).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	const getOtherUser = () => {
		return allUsers.find((u) => u.id !== user?.id)
	}

	const otherUser = getOtherUser()

	return (
		<div className='flex flex-col h-screen bg-gray-50'>
			{/* Header */}
			<div className='bg-white shadow-sm border-b px-6 py-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-4'>
						<div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
							<span className='text-white font-bold'>
								{user?.username.charAt(0).toUpperCase()}
							</span>
						</div>
						<div>
							<h1 className='text-xl font-semibold text-gray-900'>
								Chat with {otherUser?.username || 'Everyone'}
							</h1>
							<p className='text-sm text-gray-500'>
								{isConnected ? 'Connected' : 'Connecting...'}
							</p>
						</div>
					</div>
					<button
						onClick={logout}
						className='px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors'>
						Logout
					</button>
				</div>
			</div>

			{/* Messages */}
			<div className='flex-1 overflow-y-auto p-6 space-y-4'>
				{messages.length === 0 ? (
					<div className='text-center py-12'>
						<div className='w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4'>
							<svg
								className='w-8 h-8 text-gray-400'
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
						<p className='text-gray-500'>
							No messages yet. Start the conversation!
						</p>
					</div>
				) : (
					messages.map((message) => (
						<div
							key={message.id}
							className={`flex ${
								message.senderId === user?.id ? 'justify-end' : 'justify-start'
							}`}>
							<div
								className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
									message.senderId === user?.id
										? 'bg-blue-600 text-white rounded-br-md'
										: 'bg-white text-gray-900 rounded-bl-md shadow-sm border'
								}`}>
								<div className='flex items-baseline space-x-2 mb-1'>
									<span
										className={`text-xs font-medium ${
											message.senderId === user?.id
												? 'text-blue-100'
												: 'text-gray-600'
										}`}>
										{message.senderUsername}
									</span>
									<span
										className={`text-xs ${
											message.senderId === user?.id
												? 'text-blue-200'
												: 'text-gray-400'
										}`}>
										{formatTime(message.timestamp)}
									</span>
								</div>
								<p className='text-sm'>{message.content}</p>
							</div>
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Message Input */}
			<div className='bg-white border-t px-6 py-4'>
				<form onSubmit={sendMessage} className='flex space-x-4'>
					<input
						type='text'
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						placeholder='Type your message...'
						className='flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
						disabled={!isConnected}
					/>
					<button
						type='submit'
						disabled={!newMessage.trim() || !isConnected}
						className='px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
						<svg
							className='w-5 h-5'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
							/>
						</svg>
					</button>
				</form>
			</div>
		</div>
	)
}

export default Chat
