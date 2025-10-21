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
		<div className='flex flex-col h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
			{/* Modern Header */}
			<div className='bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-4'>
						<div className='relative'>
							<div className='w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-violet-500/20'>
								<span className='text-white font-bold text-lg'>
									{user?.username.charAt(0).toUpperCase()}
								</span>
							</div>
							<div
								className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${
									isConnected ? 'bg-emerald-500' : 'bg-red-500'
								}`}></div>
						</div>
						<div>
							<h1 className='text-xl font-bold text-white flex items-center'>
								💬 {otherUser?.username || 'Everyone'}
								<span className='ml-2 text-sm text-violet-400 font-normal'>
									#{roomId}
								</span>
							</h1>
							<p className='text-sm text-slate-400 flex items-center'>
								<div
									className={`w-2 h-2 rounded-full mr-2 ${
										isConnected ? 'bg-emerald-500' : 'bg-red-500'
									}`}></div>
								{isConnected ? 'Connected' : 'Connecting...'}
							</p>
						</div>
					</div>
					<button
						onClick={logout}
						className='flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium group'>
						<svg
							className='w-5 h-5 group-hover:rotate-12 transition-transform duration-200'
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

			{/* Modern Messages Container */}
			<div className='flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-violet-500/20 scrollbar-track-transparent'>
				{messages.length === 0 ? (
					<div className='text-center py-16'>
						<div className='w-24 h-24 bg-gradient-to-r from-violet-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-violet-500/30'>
							<svg
								className='w-12 h-12 text-violet-400'
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
						<h3 className='text-2xl font-bold text-white mb-3'>
							Start the conversation! 🚀
						</h3>
						<p className='text-slate-400 text-lg'>
							Send your first message to begin chatting with{' '}
							<span className='text-violet-400 font-semibold'>
								{otherUser?.username || 'everyone'}
							</span>
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
								} animate-fade-in-up`}>
								{!isMyMessage && (
									<div className='flex-shrink-0 mr-3'>
										<div className='w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg'>
											{message.senderUsername.charAt(0).toUpperCase()}
										</div>
									</div>
								)}
								<div className={`max-w-md ${isMyMessage ? 'ml-12' : 'mr-12'}`}>
									<div
										className={`px-6 py-4 rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
											isMyMessage
												? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-violet-500/30 rounded-br-md'
												: 'bg-white/10 text-white border-white/20 rounded-bl-md'
										}`}>
										<div className='flex items-baseline space-x-3 mb-2'>
											<span
												className={`text-xs font-bold tracking-wide uppercase ${
													isMyMessage ? 'text-violet-200' : 'text-emerald-400'
												}`}>
												{isMyMessage ? '✨ You' : `👤 ${message.senderUsername}`}
											</span>
											<span
												className={`text-xs ${
													isMyMessage ? 'text-violet-300' : 'text-slate-400'
												}`}>
												{formatTime(message.timestamp)}
											</span>
										</div>
										<p className='text-base leading-relaxed font-medium'>
											{message.content}
										</p>
									</div>
								</div>
								{isMyMessage && (
									<div className='flex-shrink-0 ml-3'>
										<div className='w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-violet-500/30'>
											{user?.username.charAt(0).toUpperCase()}
										</div>
									</div>
								)}
							</div>
						)
					})
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Modern Message Input */}
			<div className='bg-white/5 backdrop-blur-xl border-t border-white/10 px-6 py-6'>
				<form onSubmit={sendMessage} className='flex space-x-4 items-end'>
					<div className='flex-1 relative'>
						<input
							type='text'
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							placeholder={`Message ${otherUser?.username || 'everyone'}...`}
							className='w-full px-6 py-4 pr-16 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all duration-200 text-white placeholder-slate-400 backdrop-blur-sm hover:bg-white/15 focus:bg-white/20 text-lg'
							disabled={!isConnected}
						/>
						<div className='absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2'>
							<div
								className={`w-3 h-3 rounded-full ${
									isConnected ? 'bg-emerald-500' : 'bg-red-500'
								} animate-pulse`}></div>
							<span className='text-xs text-slate-400 font-medium'>
								{isConnected ? 'Online' : 'Offline'}
							</span>
						</div>
					</div>
					<button
						type='submit'
						disabled={!newMessage.trim() || !isConnected}
						className='px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl hover:from-violet-700 hover:to-purple-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 font-semibold text-lg group'>
						<svg
							className='w-6 h-6 group-hover:rotate-12 transition-transform duration-200'
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
				<div className='flex items-center justify-between mt-4 text-xs text-slate-500'>
					<span>Press Enter to send</span>
					<span className='flex items-center space-x-2'>
						<span>🔒 End-to-end encrypted</span>
						<div className='w-1 h-1 bg-slate-500 rounded-full'></div>
						<span>{messages.length} messages</span>
					</span>
				</div>
			</div>
		</div>
	)
}

export default Chat
