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
		<div className='flex flex-col h-screen bg-gray-50'>
			{/* Header */}
			<div className='bg-white border-b border-gray-200 px-6 py-4 shadow-sm'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-3'>
						<div className='relative'>
							<div className='w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center'>
								<span className='text-white font-bold text-sm'>
									{user?.username.charAt(0).toUpperCase()}
								</span>
							</div>
							<div
								className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
									isConnected ? 'bg-green-500' : 'bg-gray-400'
								}`}></div>
						</div>
						<div>
							<h1 className='text-lg font-semibold text-gray-900'>
								Chat with {otherUser?.username || 'Everyone'}
							</h1>
							<p className='text-sm text-gray-500'>
								{isConnected ? 'Connected' : 'Connecting...'}
							</p>
						</div>
					</div>
					<button
						onClick={logout}
						className='px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors'>
						Logout
					</button>
				</div>
			</div>

			{/* Messages */}
			<div className='flex-1 overflow-y-auto p-4 space-y-3'>
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
						<h3 className='text-lg font-medium text-gray-900 mb-2'>
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
								}`}>
								<div
									className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
										isMyMessage
											? 'bg-blue-500 text-white'
											: 'bg-white text-gray-900 border border-gray-200'
									}`}>
									<div className='flex items-baseline space-x-2 mb-1'>
										<span
											className={`text-xs font-medium ${
												isMyMessage ? 'text-blue-100' : 'text-gray-600'
											}`}>
											{isMyMessage ? 'You' : message.senderUsername}
										</span>
										<span
											className={`text-xs ${
												isMyMessage ? 'text-blue-200' : 'text-gray-400'
											}`}>
											{formatTime(message.timestamp)}
										</span>
									</div>
									<p className='text-sm leading-relaxed'>{message.content}</p>
								</div>
							</div>
						)
					})
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<div className='bg-white border-t border-gray-200 px-4 py-4'>
				<form onSubmit={sendMessage} className='flex space-x-3'>
					<div className='flex-1'>
						<input
							type='text'
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							placeholder='Type your message...'
							className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
							disabled={!isConnected}
						/>
					</div>
					<button
						type='submit'
						disabled={!newMessage.trim() || !isConnected}
						className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
						Send
					</button>
				</form>
			</div>
		</div>
	)
}

export default Chat
