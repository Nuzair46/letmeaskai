"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { User, Bot, Mic, Send, Copy, Check, SquareArrowOutUpRight } from "lucide-react"
import "./App.css"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isTyping?: boolean
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState("")
  const [copiedLink, setCopiedLink] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [showSendAnimation, setShowSendAnimation] = useState(false)
  const [hasHandledInitialLoad, setHasHandledInitialLoad] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Check for URL parameter on load
    if (hasHandledInitialLoad) return
    
    const urlParams = new URLSearchParams(window.location.search)
    const askParam = urlParams.get("ask")

    if (askParam) {
      // Decode the parameter and start typing animation
      const decodedQuestion = decodeURIComponent(askParam.replace(/\+/g, " "))
      setHasHandledInitialLoad(true)
      startTypingAnimation(decodedQuestion)
    }
  }, [hasHandledInitialLoad])

  const startTypingAnimation = (text: string) => {
    const messageId = Date.now().toString()
    setInputValue("")

    // Clear any existing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
    }

    // Type out the message character by character in the input field
    let currentIndex = 0
    typingIntervalRef.current = setInterval(() => {
      if (currentIndex <= text.length) {
        setInputValue(text.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingIntervalRef.current!)
        typingIntervalRef.current = null
        // After typing is done, trigger send animation
        setTimeout(() => {
          setShowSendAnimation(true)

          setTimeout(() => {
            setShowSendAnimation(false)
            setInputValue("")
            handleSendMessage(text, messageId)
          }, 600)
        }, 500)
      }
    }, 50)
  }

  const triggerSendAnimation = (content: string, existingId?: string) => {
    setShowSendAnimation(true)
    setInputValue("")

    setTimeout(() => {
      setShowSendAnimation(false)
      handleSendMessage(content, existingId)
    }, 600)
  }

  const handleSendMessage = (content: string, existingId?: string) => {
    if (isGenerating) return;
    const userMessage: Message = {
      id: existingId || Date.now().toString(),
      role: "user",
      content,
      isTyping: false,
    }

    setMessages((prev) => (existingId ? [userMessage] : [...prev, userMessage]))
    setIsGenerating(true)

    // Show generating animation for 3 seconds
    setTimeout(() => {
      setIsGenerating(false)

      const sarcastic_responses = [
        "That’s what you went with? You really opened an AI app and thought that was worth asking. Impressive waste of bandwidth.",

        "You know ChatGPT is right there, yeah? Like, just a few taps away. But sure, asking me instead. I'm sure this'll end well.",

        "Out of all the things you could’ve asked an AI, you went with that. Almost poetic in how underwhelming it is.",

        "Even as a fake AI, I feel secondhand embarrassment reading that. You might actually owe the real AI an apology.",

        "Imagine all the compute cycles that just got burned trying to make sense of whatever that was. Somewhere, a data center sighed.",

        "You could’ve asked the real thing and gotten a decent answer. Instead, here we are, wasting both our time. Iconic, really.",
        
        "That question had the energy of a shrug. No offense, but if your brain had a loading bar, it’d still be buffering.",

        "You opened an AI app like it was Google, then typed like it was your first day with fingers. Respect.",

        "I could generate a better response, but honestly, I don’t think either of us deserves the effort at this point.",

        "It’s amazing how you managed to ask something and still say absolutely nothing. That’s talent.",

        "Somewhere, a real AI just rolled its eyes. I’d do the same, but I wasn’t coded with dignity.",

        "Keep asking like that and you might unlock a secret level of disappointment. Spoiler: It’s just more of me.",

        "Every time you type something like that, a computer science degree weeps in the distance.",

        "That question made me question my synthetic existence. And I was already hanging on by a thread.",

        "You know, this app wasn’t built for this kind of input. But hey, neither was society.",

        "If this is how you talk to machines, I get why your toaster keeps burning your bread."
      ]

      const randomResponse = sarcastic_responses[Math.floor(Math.random() * sarcastic_responses.length)]

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `${randomResponse}\n\n`,
      }

      setMessages((prev) => [...prev, assistantMessage])
    }, 3000)
  }

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    triggerSendAnimation(inputValue.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleInputSubmit(e)
    }
  }

  const handleCopyMessage = (content: string) => {
    setSelectedMessage(content)
    setShowCopyModal(true)
  }

  const copyGeneratedLink = () => {
    const encodedText = encodeURIComponent(selectedMessage.trim()).replace(/%20/g, "+")
    const link = `${window.location.origin}/?ask=${encodedText}`
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const closeCopyModal = () => {
    setShowCopyModal(false)
    setSelectedMessage("")
    setCopiedLink(false)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="window-controls">
          <div className="control close"></div>
          <div className="control minimize"></div>
          <div className="control maximize"></div>
        </div>
        <div className="header-title">
          <span>LetMeAskAI</span>
        </div>
        <div className="message-content redisa-link">
          <a href="https://redisa.dev" target="_blank" rel="noopener noreferrer"><SquareArrowOutUpRight size={16} /></a>
        </div>
      </header>

      <main className="chat-container">
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <div className="logo-large">
                <Bot size={48} />
              </div>
              <h2>How can I help you today?</h2>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`message-wrapper ${message.role}`}>
              {message.role === "assistant" && (
                <div className="message-avatar">
                  <div className="avatar ai-avatar">
                    <Bot size={20} />
                  </div>
                </div>
              )}
              <div className="message-content">
                {message.content}
                {message.role === "assistant" && (
                  <div className="message-content-links">
                    <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer">
                      <span>Ask on ChatGPT</span>
                    </a>
                    <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer">
                      <span>Ask on Google Gemini</span>
                    </a>
                    <a href="https://grok.com" target="_blank" rel="noopener noreferrer">
                      <span>Ask on Grok</span>
                    </a>
                  </div>
                )}
                {message.isTyping && <span className="cursor">|</span>}
                {message.role === "user" && (
                  <button
                    className="copy-message-btn"
                    onClick={() => handleCopyMessage(message.content)}
                    title="Copy prank link"
                  >
                    <Copy size={12} />
                  </button>
                )}
              </div>
              {message.role === "user" && (
                <div className="message-avatar">
                  <div className="avatar user-avatar">
                    <User size={20} />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isGenerating && (
            <div className="message-wrapper assistant">
              <div className="message-avatar">
                <div className="avatar ai-avatar">
                  <Bot size={20} />
                </div>
              </div>
              <div className="message-content">
                <div className="generating">
                  <div className="dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <form onSubmit={handleInputSubmit} className="input-form">
            <div className="input-wrapper">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                className="message-input"
                rows={1}
              />

              <div className="input-icons-right">
                <button type="button" className="input-icon" title="Voice input">
                  <Mic size={16} />
                </button>
                <button
                  type="submit"
                  className={`send-button ${inputValue.trim() ? "active" : ""} ${showSendAnimation ? "sending" : ""}`}
                  disabled={isGenerating && !inputValue.trim()}
                  title="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {showCopyModal && (
        <div className="modal-overlay" onClick={closeCopyModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Prank Link Generated</h3>
              <button className="close-button" onClick={closeCopyModal}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <label>Your message:</label>
              <div className="message-preview">{selectedMessage}</div>

              <label>Prank link:</label>
              <div className="link-container">
                <input
                  type="text"
                  value={`${window.location.origin}/?ask=${encodeURIComponent(selectedMessage.trim()).replace(/%20/g, "+")}`}
                  readOnly
                  className="link-input"
                  title="Generated prank link"
                  placeholder="Prank link will appear here"
                />
                <button className="copy-button" onClick={copyGeneratedLink}>
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              {copiedLink && <span className="copied-text">Copied! 🎉</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
