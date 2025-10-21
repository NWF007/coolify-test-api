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
	const roomId = 'general'

	useEffect(() => {
		const initChat = async () => {
			try {
				const token = localStorage.getItem('authToken')
				if (token) {
					await chatService.connect(token)
					await chatService.joinRoom(roomId)
					setIsConnected(true)
				}

				const users = await usersApi.getAll()
				setAllUsers(users)
			} catch (error) {
				console.error('Failed to initialize chat:', error)
			}
		}

		initChat()

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
		<div className='flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
			{/* Header */}
			<div className='bg-white/90 backdrop-blur-lg shadow-lg border-b border-gray-200/50 px-6 py-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-4'>
						<div className='relative'>
							<div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg'>
								<span className='text-white font-bold text-lg'>
									{user?.username.charAt(0).toUpperCase()}
								</span>
							</div>
							<div
								className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
									isConnected ? 'bg-green-500' : 'bg-gray-400'
								}`}></div>
						</div>
						<div>
							<h1 className='text-xl font-bold text-gray-900'>
								Chat with {otherUser?.username || 'Everyone'}
							</h1>
							<p className='text-sm text-gray-500 flex items-center'>
								<div
									className={`w-2 h-2 rounded-full mr-2 ${
										isConnected ? 'bg-green-500' : 'bg-gray-400'
									}`}></div>
								{isConnected ? 'Connected' : 'Connecting...'}
							</p>
						</div>
					</div>
					<button
						onClick={logout}
						className='flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium'>
						<svg
							className='w-5 h-5'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
							/>
						</svg>
						<span>Logout</span>
					</button>
				</div>
			</div>

			{/* Messages */}
			<div className='flex-1 overflow-y-auto p-6 space-y-4'>
				{messages.length === 0 ? (
					<div className='text-center py-12'>
						<div className='w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg'>
							<svg
								className='w-10 h-10 text-gray-500'
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
						<h3 className='text-xl font-semibold text-gray-900 mb-2'>
							Start the conversation!
						</h3>
						<p className='text-gray-500'>
							Send your first message to begin chatting
						</p>
					</div>
				) : (
					messages.map((message) => {
						const isMyMessage = message.senderUsername === user?.username
						return (
							<div
								key={message.id}
								className={`flex ${
									isMyMessage ? 'justify-end' : 'justify-start'
								} animate-slide-up mb-4`}>
								<div
									className={`max-w-xs lg:max-w-md px-5 py-4 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 ${
										isMyMessage
											? 'bg-blue-600 rounded-br-md ml-12'
											: 'bg-gray-800 rounded-bl-md mr-12 border-l-4 border-orange-500'
									}`}>
									<div className='flex items-baseline space-x-2 mb-2'>
										<span
											className={`text-xs font-bold ${
												isMyMessage ? 'text-blue-100' : 'text-orange-400'
											}`}>
											{isMyMessage ? 'me' : message.senderUsername}
										</span>
										<span
											className={`text-xs ${
												isMyMessage ? 'text-blue-200' : 'text-gray-400'
											}`}>
											{formatTime(message.timestamp)}
										</span>
									</div>
									<p
										className={`text-base font-semibold ${
											isMyMessage ? 'text-white' : 'text-white'
										}`}>
										{message.content}
									</p>
								</div>
							</div>
						)
					})
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Message Input */}
			<div className='bg-white/90 backdrop-blur-lg border-t border-gray-200/50 px-6 py-4'>
				<form onSubmit={sendMessage} className='flex space-x-4'>
					<div className='flex-1 relative'>
						<input
							type='text'
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							placeholder='Type your message...'
							className='w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/70 hover:bg-white focus:bg-white'
							disabled={!isConnected}
						/>
						<div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
							<div
								className={`w-2 h-2 rounded-full ${
									isConnected ? 'bg-green-500' : 'bg-red-500'
								}`}></div>
						</div>
					</div>
					<button
						type='submit'
						disabled={!newMessage.trim() || !isConnected}
						className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'>
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
