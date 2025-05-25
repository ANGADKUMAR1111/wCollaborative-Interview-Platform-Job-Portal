import { useRef, useEffect, useContext, useState } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { MdWifiOff } from 'react-icons/md';
import { RiRefreshLine } from 'react-icons/ri';
import { useChatbot } from './ChatbotContext';
import { Context } from '../../main';
import './Chatbot.css';

const Chatbot = () => {
  const { 
    isChatOpen, 
    messages, 
    isLoading, 
    isOfflineMode,
    toggleChat, 
    sendMessage,
    startChat,
    resetChat,
    sessionActive
  } = useChatbot();
  
  const [retrying, setRetrying] = useState(false);
  const { isAuthorized, user } = useContext(Context);
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatFormRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [isChatOpen]);

  // Initialize chat session when component mounts
  useEffect(() => {
    if (isAuthorized && user?.role === "Job Seeker" && !sessionActive && isChatOpen) {
      startChat();
    }
  }, [isAuthorized, user, sessionActive, isChatOpen, startChat]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const messageText = messageInputRef.current.value.trim();
    if (messageText) {
      sendMessage(messageText);
      messageInputRef.current.value = '';
    }
  };
  
  const handleRetryConnection = () => {
    setRetrying(true);
    
    // Reset chat will try to reconnect
    resetChat();
    
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
        {!isUser && !isSystem && <div className="message-content">{message.content}</div>}
        {isUser && <div className="message-content">{message.content}</div>}
        {isSystem && <div className="message-content">{message.content}</div>}
      </div>
    );
  };

  // Only show for job seekers
  if (!isAuthorized || user?.role !== "Job Seeker") {
    return null;
  }

  return (
    <div className="chatbot-container">
      

      {/* Chat Window */}
      {isChatOpen && (
        <div className="chatbot-window">
          {/* Chat Header */}
          <div className={`chatbot-header ${isOfflineMode ? 'offline-mode' : ''}`}>
            <div className="chatbot-title">
              <FaRobot className="chatbot-icon" />
              <h3>Job Search Assistant {isOfflineMode && <MdWifiOff className="offline-icon" />}</h3>
            </div>
            <button 
              className="close-button"
              onClick={toggleChat}
              aria-label="Close chatbot"
            >
              <FaTimes />
            </button>
          </div>

          {isOfflineMode && (
            <div className="offline-banner">
              <div>Running in offline mode - Limited functionality</div>
              <button 
                className={`retry-button ${retrying ? 'retrying' : ''}`}
                onClick={handleRetryConnection}
                disabled={retrying}
              >
                {retrying ? <RiRefreshLine className="spin-icon" /> : 'Retry'}
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div className="chatbot-messages">
            {messages.map(renderMessage)}
            
            {isLoading && (
              <div className="message bot-message">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form ref={chatFormRef} className="chatbot-input" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder={isOfflineMode ? "Offline mode - limited responses" : "Type your message..."}
              ref={messageInputRef}
              aria-label="Type your message"
            />
            <button type="submit" aria-label="Send message">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 