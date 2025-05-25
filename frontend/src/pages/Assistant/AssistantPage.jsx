import { useRef, useEffect, useContext, useState, useCallback } from 'react';
import { useChatbot } from '../../components/Chatbot/ChatbotContext';
import { Context } from '../../main';
import { FaRobot, FaPaperPlane } from 'react-icons/fa';
import { RiRefreshLine } from 'react-icons/ri';
import { MdWifiOff } from 'react-icons/md';
import './AssistantPage.css';

const AssistantPage = () => {
  const { 
    messages, 
    isLoading, 
    isOfflineMode,
    sendMessage,
    startChat,
    sessionActive,
    resetChat,
    checkModelStatus
  } = useChatbot();
  
  const [retrying, setRetrying] = useState(false);
  const [inputText, setInputText] = useState('');
  const { isAuthorized, user } = useContext(Context);
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatFormRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Function to scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    // Use a slight delay to ensure all content is rendered
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  // Focus input when component mounts
  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, []);

  // Initialize chat session when component mounts
  useEffect(() => {
    if (isAuthorized && user?.role === "Job Seeker" && !sessionActive) {
      startChat();
    }
  }, [isAuthorized, user, sessionActive, startChat]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const messageText = inputText.trim();
    if (messageText) {
      sendMessage(messageText);
      setInputText('');
    }
  };
  
  const handleRetryConnection = () => {
    setRetrying(true);
    
    // Check model status first
    checkModelStatus().then(isAvailable => {
      if (isAvailable) {
        // If available, reset the chat to start fresh
        resetChat();
      } else {
        // If not available, just refresh the UI
        setTimeout(() => {
          setRetrying(false);
        }, 2000);
      }
    });
    
    // Reset retrying state after 3 seconds
    setTimeout(() => {
      setRetrying(false);
    }, 3000);
  };

  // Render message with proper formatting
  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    
    return (
      <div 
        key={index} 
        className={`message ${isUser ? 'user-message' : isSystem ? 'system-message' : 'bot-message'}`}
      >
        {!isUser && !isSystem && (
          <div className="bot-avatar">
            <FaRobot className="message-icon" />
          </div>
        )}
        <div className="message-content">{message.content}</div>
      </div>
    );
  };

  if (!isAuthorized || user?.role !== "Job Seeker") {
    return (
      <div className="assistant-unauthorized">
        <div className="assistant-content">
          <FaRobot className="assistant-icon" />
          <h2>Access Restricted</h2>
          <p>The Job Search Assistant is only available for job seekers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="assistant-page">
      <div className="assistant-container">
        <div className={`assistant-header ${isOfflineMode ? 'offline-mode' : ''}`}>
          <div className="assistant-title">
            <FaRobot className="assistant-icon" />
            <h2>Job Search Assistant {isOfflineMode && <MdWifiOff className="offline-icon" />}</h2>
          </div>
          <button 
            className="refresh-button"
            onClick={resetChat}
            aria-label="Reset conversation"
          >
            <RiRefreshLine />
          </button>
        </div>

        {isOfflineMode && (
          <div className="offline-banner">
            <div>Running in offline mode with limited functionality</div>
            <button 
              className={`retry-button ${retrying ? 'retrying' : ''}`}
              onClick={handleRetryConnection}
              disabled={retrying}
            >
              {retrying ? 'Reconnecting...' : 'Retry'}
            </button>
          </div>
        )}

        <div className="assistant-description">
          <p>
            I&apos;m your AI job search assistant. Ask me anything about:
          </p>
          <ul>
            <li>Resume writing and improvement</li>
            <li>Job search strategies</li>
            <li>Interview preparation</li>
            <li>Career development</li>
            <li>Industry-specific advice</li>
          </ul>
        </div>
        
        <div className="assistant-messages" ref={messagesContainerRef}>
          {messages.map(renderMessage)}
          
          {isLoading && (
            <div className="message bot-message">
              <div className="bot-avatar">
                <FaRobot className="message-icon" />
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} style={{ float: 'left', clear: 'both' }} />
        </div>

        <form ref={chatFormRef} className="assistant-input" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={isOfflineMode ? "Offline mode - limited responses available" : "Type your message..."}
            ref={messageInputRef}
            value={inputText}
            onChange={handleInputChange}
            aria-label="Type your message"
            maxLength={1500}
          />
          {inputText.length > 0 && (
            <div className="char-counter">
              {inputText.length}/1500
            </div>
          )}
          <button 
            type="submit" 
            aria-label="Send message"
            className="send-button"
            disabled={!inputText.trim()}
          >
            <div className="send-icon-circle">
              <FaPaperPlane className="send-icon" />
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssistantPage; 