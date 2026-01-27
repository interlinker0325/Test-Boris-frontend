'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, ShoppingBag, User, Bot, CheckCircle, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import axios from 'axios'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface BackendResponse {
  response: string
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [negotiationCompleted, setNegotiationCompleted] = useState(false)
  const [currentOffer, setCurrentOffer] = useState<number | null>(null)
  const [finalPrice, setFinalPrice] = useState<number | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])


  // Send user input to backend and receive response
  const sendMessageToBackend = async (userMessage: string): Promise<string> => {
    const response = await axios.post('https://communal-personally-crane.ngrok-free.app/chat', 
      { message: userMessage }, 
      { 
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )

    if (response.status === 200) {
      const backendResponse: BackendResponse = response.data
      console.log('backendResponse------>', backendResponse)
      
      return backendResponse.response
    } else {
      throw new Error('Failed to get response from backend')
    }
  }

  const handleDealAccept = () => {
    // Redirect to checkout when deal is accepted
    if (sessionId && finalPrice) {
      const checkoutUrl = `/checkout?session_id=${sessionId}&price=${finalPrice}`
      console.log('Redirecting to checkout:', checkoutUrl)
      window.location.href = checkoutUrl
    }
  }

  const handleDealDecline = () => {
    // Reset negotiation state and show input panel again
    setNegotiationCompleted(false)
    setCurrentOffer(null)
    setFinalPrice(null)
    setSessionId(null)
    
    // Add a message indicating the deal was declined
    const declineMessage: Message = {
      id: Date.now().toString(),
      text: 'No problem! Feel free to continue negotiating or ask me about other options.',
      sender: 'bot',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, declineMessage])
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      // Send user message to backend and get response
      const botResponseText = await sendMessageToBackend(inputValue)
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Error sending message to backend:', error)
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
        sender: 'bot',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Chat Window - Always Visible with Specific Dimensions */}
      <div className="chat-window flex flex-col">
        {/* Chat Header */}
        <div className="chat-header flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Test Assistant</h3>
                <p className="text-sm text-white/90">Online • Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Body */}
        <div className="chat-body flex-1 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'chat-message animate-slide-up',
                message.sender === 'user' ? 'user' : 'bot'
              )}
            >
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="whitespace-pre-line">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="chat-message bot animate-fade-in">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Footer - Conditionally Show Input or Deal Buttons */}
        {!negotiationCompleted ? (
          <div className="chat-footer flex-shrink-0">
            <div className="flex space-x-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="chat-input flex-1 resize-none"
                disabled={isTyping}
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="chat-button"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-footer flex-shrink-0">
            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Deal Summary</h4>
              <p className="text-sm text-gray-600 mb-3">
                Final Price: <span className="font-bold text-green-600">${finalPrice}</span>
              </p>
            </div>
            
            {/* Deal Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleDealAccept}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Accept Deal</span>
              </button>
              <button
                onClick={handleDealDecline}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <XCircle className="w-5 h-5" />
                <span>No Deal</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Chatbot
