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
	const [isTyping, setIsTyping] = useState(false)
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
			// Simulate typing indicator reset
			setIsTyping(false)
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
			setIsTyping(false)
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
		<div className='flex flex-col h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden'>
			{/* Animated background elements */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse'></div>
				<div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000'></div>
			</div>

			{/* Header */}
			<div className='relative bg-white/80 backdrop-blur-xl border-b border-white/20 px-6 py-4 shadow-lg shadow-black/5'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-4'>
						<div className='relative group'>
							<div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200'>
								<span className='text-white font-bold text-lg'>
									{user?.username.charAt(0).toUpperCase()}
								</span>
							</div>
							<div
								className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-md transition-colors duration-300 ${
									isConnected ? 'bg-emerald-500' : 'bg-gray-400'
								}`}>
								{isConnected && (
									<div className='w-full h-full bg-emerald-500 rounded-full animate-ping'></div>
								)}
							</div>
						</div>
						<div>
							<h1 className='text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'>
								Chat with {otherUser?.username || 'Everyone'}
							</h1>
							<p className='text-sm text-gray-600 flex items-center space-x-2'>
								<span
									className={`w-2 h-2 rounded-full ${
										isConnected ? 'bg-emerald-500' : 'bg-gray-400'
									}`}></span>
								<span>{isConnected ? 'Connected' : 'Connecting...'}</span>
								{isTyping && (
									<span className='text-purple-600 font-medium animate-pulse'>
										{otherUser?.username} is typing...
									</span>
								)}
							</p>
						</div>
					</div>
					<button
						onClick={logout}
						className='px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200 hover:shadow-md backdrop-blur-sm border border-transparent hover:border-white/30'>
						<span className='font-medium'>Logout</span>
					</button>
				</div>
			</div>

			{/* Messages */}
			<div className='flex-1 overflow-y-auto p-6 space-y-4 relative'>
				{messages.length === 0 ? (
					<div className='text-center py-16 relative'>
						<div className='relative inline-block'>
							<div className='w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105'>
								<svg
									className='w-10 h-10 text-white'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={1.5}
										d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
									/>
								</svg>
							</div>
							<div className='absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full animate-bounce'></div>
						</div>
						<h3 className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3'>
							Start the conversation!
						</h3>
						<p className='text-gray-600 max-w-md mx-auto leading-relaxed'>
							Send your first message to begin an amazing chat experience
						</p>
					</div>
				) : (
					messages.map((message, index) => {
						const isMyMessage = message.senderUsername === user?.username
						const prevMessage = messages[index - 1]
						const showAvatar =
							!prevMessage ||
							prevMessage.senderUsername !== message.senderUsername

						return (
							<div
								key={message.id}
								className={`flex items-end space-x-3 animate-in slide-in-from-bottom duration-300 ${
									isMyMessage ? 'flex-row-reverse space-x-reverse' : ''
								}`}>
								{/* Avatar */}
								<div
									className={`flex-shrink-0 ${
										showAvatar ? 'opacity-100' : 'opacity-0'
									}`}>
									<div
										className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ${
											isMyMessage
												? 'bg-gradient-to-br from-purple-500 to-blue-600'
												: 'bg-gradient-to-br from-emerald-500 to-teal-600'
										}`}>
										{(isMyMessage ? user?.username : message.senderUsername)
											?.charAt(0)
											.toUpperCase()}
									</div>
								</div>

								{/* Message bubble */}
								<div
									className={`group max-w-xs lg:max-w-md ${
										isMyMessage ? 'ml-12' : 'mr-12'
									}`}>
									{showAvatar && (
										<div
											className={`text-xs font-medium mb-1 px-1 ${
												isMyMessage
													? 'text-right text-purple-600'
													: 'text-left text-emerald-600'
											}`}>
											{isMyMessage ? 'You' : message.senderUsername}
										</div>
									)}
									<div
										className={`px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 group-hover:shadow-xl relative ${
											isMyMessage
												? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-purple-500/25 group-hover:shadow-purple-500/40'
												: 'bg-white/90 backdrop-blur-sm text-gray-800 border border-white/50 shadow-black/10 group-hover:shadow-black/20'
										} ${
											showAvatar
												? isMyMessage
													? 'rounded-br-md'
													: 'rounded-bl-md'
												: ''
										}`}>
										<p className='text-sm leading-relaxed'>{message.content}</p>
										<div
											className={`text-xs mt-2 opacity-70 ${
												isMyMessage ? 'text-purple-100' : 'text-gray-500'
											}`}>
											{formatTime(message.timestamp)}
										</div>

										{/* Message tail */}
										{showAvatar && (
											<div
												className={`absolute bottom-0 w-3 h-3 ${
													isMyMessage
														? '-right-1 bg-gradient-to-br from-purple-500 to-blue-600 transform rotate-45'
														: '-left-1 bg-white/90 border-l border-b border-white/50 transform rotate-45'
												}`}></div>
										)}
									</div>
								</div>
							</div>
						)
					})
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<div className='relative bg-white/80 backdrop-blur-xl border-t border-white/20 px-6 py-4 shadow-lg shadow-black/5'>
				<form onSubmit={sendMessage} className='flex items-end space-x-4'>
					<div className='flex-1 relative'>
						<input
							type='text'
							value={newMessage}
							onChange={(e) => {
								setNewMessage(e.target.value)
								if (e.target.value.trim()) {
									setIsTyping(true)
								} else {
									setIsTyping(false)
								}
							}}
							placeholder='Type your message...'
							className='w-full px-6 py-4 bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none shadow-lg shadow-black/5 transition-all duration-200 hover:shadow-xl text-gray-800 placeholder-gray-500'
							disabled={!isConnected}
						/>
						{!isConnected && (
							<div className='absolute inset-0 bg-gray-100/50 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
								<span className='text-gray-500 text-sm font-medium'>
									Connecting...
								</span>
							</div>
						)}
					</div>
					<button
						type='submit'
						disabled={!newMessage.trim() || !isConnected}
						className='p-4 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-2xl hover:from-purple-600 hover:to-blue-700 focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95 group'>
						<svg
							className='w-6 h-6 transform group-hover:translate-x-0.5 transition-transform duration-200'
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
