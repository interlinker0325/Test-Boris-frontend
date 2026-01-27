'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Bot, Calendar, Clock, Search, RefreshCw } from 'lucide-react'
import axios from 'axios'

interface MessageHistory {
  _id: string
  userInput: string
  botResponse: string
  timestamp: string
  sessionId?: string
  createdAt: string
}

const HistoryPage: React.FC = () => {
  const router = useRouter()
  const [messages, setMessages] = useState<MessageHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  // Get unique session IDs
  const sessionIds = Array.from(
    new Set(messages.map(msg => msg.sessionId).filter((id): id is string => Boolean(id)))
  )

  // Filter messages based on search and session
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = searchTerm === '' || 
      msg.userInput.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.botResponse.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSession = !selectedSession || msg.sessionId === selectedSession
    return matchesSearch && matchesSession
  })

  // Group messages by date
  const groupedMessages = filteredMessages.reduce((acc, msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(msg)
    return acc
  }, {} as Record<string, MessageHistory[]>)

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get('/api/messages?limit=1000')
      if (response.data.success) {
        setMessages(response.data.messages)
      } else {
        setError('Failed to fetch messages')
      }
    } catch (err: any) {
      console.error('Error fetching history:', err)
      setError('Failed to load chat history. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chat History</h1>
                <p className="text-sm text-gray-500 mt-1">
                  View all your past conversations
                </p>
              </div>
            </div>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Session Filter */}
            {sessionIds.length > 0 && (
              <div className="sm:w-64">
                <select
                  value={selectedSession || ''}
                  onChange={(e) => setSelectedSession(e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Sessions</option>
                  {sessionIds.map(sessionId => (
                    <option key={sessionId} value={sessionId}>
                      Session: {sessionId && sessionId.length > 8 ? sessionId.slice(-8) : sessionId}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">Loading chat history...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchHistory}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">No messages found</p>
                <p className="text-gray-400 text-sm">
                  {searchTerm || selectedSession 
                    ? 'Try adjusting your filters' 
                    : 'Start a conversation to see your chat history here'}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {Object.entries(groupedMessages)
                .sort(([dateA], [dateB]) => 
                  new Date(dateB).getTime() - new Date(dateA).getTime()
                )
                .map(([date, dateMessages]) => (
                  <div key={date} className="p-6">
                    {/* Date Header */}
                    <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-gray-200">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <h2 className="text-lg font-semibold text-gray-700">{date}</h2>
                      <span className="text-sm text-gray-400">
                        ({dateMessages.length} {dateMessages.length === 1 ? 'conversation' : 'conversations'})
                      </span>
                    </div>

                    {/* Messages for this date */}
                    <div className="space-y-4">
                      {dateMessages
                        .sort((a, b) => 
                          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                        )
                        .map((msg) => (
                          <div
                            key={msg._id}
                            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                          >
                            {/* User Message */}
                            <div className="mb-3">
                              <div className="flex items-start space-x-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="bg-blue-500 text-white rounded-lg px-4 py-2 inline-block max-w-3xl">
                                    <p className="whitespace-pre-line">{msg.userInput}</p>
                                  </div>
                                  <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatTime(msg.timestamp)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Bot Response */}
                            <div>
                              <div className="flex items-start space-x-2">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Bot className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 inline-block max-w-3xl">
                                    <p className="whitespace-pre-line text-gray-800">{msg.botResponse}</p>
                                  </div>
                                  <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatTime(msg.timestamp)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        {!loading && !error && messages.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Showing {filteredMessages.length} of {messages.length} total messages
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage

