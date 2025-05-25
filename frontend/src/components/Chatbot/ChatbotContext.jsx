import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Context } from "../../main";
import axios from "axios";

const ChatbotContext = createContext();

export const useChatbot = () => useContext(ChatbotContext);

// Fallback responses when the server is unavailable
const getFallbackResponse = () => {
  const fallbackResponses = [
    "I'm here to help with your job search! Could you tell me more about what you're looking for?",
    "As your job search assistant, I can provide general advice on resumes, interviews, and career development.",
    "I'm ready to help with your career questions. What specific aspect of job searching can I assist with?",
    "I'd be happy to provide guidance on your job search journey. What challenges are you facing currently?",
  ];

  return fallbackResponses[
    Math.floor(Math.random() * fallbackResponses.length)
  ];
};

export const ChatbotProvider = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Hi there! How can I help with your job search today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [error, setError] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [modelStatus, setModelStatus] = useState("unknown"); // 'available', 'unavailable', 'unknown'

  const { isAuthorized, user } = useContext(Context);

  // Check if the AI model is available
  const checkModelStatus = useCallback(async () => {
    if (!isAuthorized) return;

    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/v1/utils/check-models",
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      if (data.success) {
        setModelStatus("available");
        setIsOfflineMode(false);
        console.log("Model is available:", data.suggestedModel);
        return true;
      } else {
        setModelStatus("unavailable");
        setIsOfflineMode(true);
        return false;
      }
    } catch (err) {
      console.error("Error checking model status:", err);
      setModelStatus("unavailable");
      setIsOfflineMode(true);
      return false;
    }
  }, [isAuthorized]);

  // Initialize with a model status check when authorized
  useEffect(() => {
    if (isAuthorized && user?.role === "Job Seeker") {
      checkModelStatus();
    }
  }, [isAuthorized, user, checkModelStatus]);

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  const startChat = async () => {
    if (!isAuthorized) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check model status before starting chat
      if (modelStatus === "unknown") {
        await checkModelStatus();
      }

      const { data } = await axios.post(
        "http://localhost:4000/api/v1/chatbot/start",
        { userId: user?._id },
        {
          withCredentials: true,
          timeout: 8000, // Increase timeout to 8 seconds
        }
      );

      setSessionActive(true);
      setIsOfflineMode(false);
      setMessages([
        {
          role: "bot",
          content:
            data.greeting ||
            "Hi there! I'm your job search assistant. How can I help you today?",
        },
      ]);
    } catch (err) {
      console.error("Error starting chat:", err);

      // Set to offline mode and use fallback
      setIsOfflineMode(true);
      setSessionActive(true);

      // Try to get a fallback response from the server
      try {
        const { data } = await axios.post(
          "http://localhost:4000/api/v1/chatbot/fallback",
          { message: "greeting" },
          {
            withCredentials: true,
            timeout: 3000,
          }
        );

        setMessages([
          {
            role: "bot",
            content:
              data.response ||
              "Hi there! I'm your job search assistant running in offline mode. I can provide general advice, but my capabilities are limited. How can I help you today?",
          },
        ]);
      } catch (fallbackErr) {
        // If even the fallback endpoint fails, use a default message
        setMessages([
          {
            role: "bot",
            content:
              "Hi there! I'm your job search assistant running in offline mode. I can provide general advice, but my capabilities are limited. How can I help you today?",
          },
        ]);
      }

      // Only show error if not a connection issue
      if (
        !err.message.includes("Network Error") &&
        !err.message.includes("timeout")
      ) {
        setError("Failed to connect to assistant. Using offline mode.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = useCallback(
    async (messageText) => {
      if (!messageText.trim() || !isAuthorized) return;

      // Format user message with proper line breaks if present
      const formattedUserMessage = messageText.replace(/\n/g, "<br>");

      const userMessage = {
        role: "user",
        content: formattedUserMessage,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // If in offline mode, use local fallback
      if (isOfflineMode) {
        try {
          // Try to get a contextual fallback response from the backend even in offline mode
          const { data } = await axios.post(
            "http://localhost:4000/api/v1/chatbot/fallback",
            {
              message: messageText,
            },
            {
              withCredentials: true,
              timeout: 3000, // Short 3 second timeout
            }
          );

          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              content: data.response,
            },
          ]);
        } catch (err) {
          // If even the fallback endpoint fails, use the local fallback
          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              content: getFallbackResponse(),
            },
          ]);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Try to reconnect if previously in offline mode
      const tryMessageSend = async (retryCount = 0) => {
        try {
          const { data } = await axios.post(
            "http://localhost:4000/api/v1/chatbot/message",
            {
              userId: user?._id,
              message: messageText,
            },
            {
              withCredentials: true,
              timeout: 10000, // 10 second timeout
            }
          );

          // If we get here, we're back online
          if (isOfflineMode) setIsOfflineMode(false);

          // Format any line breaks in response for proper display
          const formattedResponse = data.response;

          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              content: formattedResponse,
            },
          ]);
          setIsLoading(false);
        } catch (err) {
          console.error(
            `Error sending message (attempt ${retryCount + 1}):`,
            err
          );

          // If this is the first try, attempt one retry
          if (retryCount === 0) {
            // Brief delay before retry
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return tryMessageSend(1);
          }

          // Switch to offline mode if server is unavailable after retry
          setIsOfflineMode(true);

          // Try the fallback endpoint
          try {
            const { data } = await axios.post(
              "http://localhost:4000/api/v1/chatbot/fallback",
              {
                message: messageText,
              },
              {
                withCredentials: true,
                timeout: 3000,
              }
            );

            setMessages((prev) => [
              ...prev,
              {
                role: "bot",
                content: data.response,
              },
            ]);
          } catch (fallbackErr) {
            // Add system message about connection issues
            setMessages((prev) => [
              ...prev,
              {
                role: "system",
                content:
                  "Connection to the assistant server failed. Operating in limited offline mode.",
              },
              {
                role: "bot",
                content:
                  "Sorry, I'm having trouble connecting to the server. I'll switch to offline mode with limited capabilities. Could you try again?",
              },
            ]);
          }

          setIsLoading(false);
        }
      };

      // Start the message sending process
      tryMessageSend();
    },
    [isAuthorized, isOfflineMode, user?._id]
  );

  const endChat = async () => {
    if (!isAuthorized) return;

    // If in offline mode, just reset locally
    if (isOfflineMode) {
      setSessionActive(false);
      setMessages([]);
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/api/v1/chatbot/end",
        {
          userId: user?._id,
        },
        {
          withCredentials: true,
          timeout: 5000,
        }
      );
      setSessionActive(false);
      setMessages([]);
    } catch (err) {
      console.error("Error ending chat session:", err);
      // Even if there's an error, reset the chat locally
      setSessionActive(false);
      setMessages([]);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: "bot",
        content: "Hi there! How can I help with your job search today?",
      },
    ]);
    setIsOfflineMode(false);
    setSessionActive(false);
    setError(null);

    // Try to start a new chat session
    if (isAuthorized && user?.role === "Job Seeker") {
      startChat();
    }
  };

  // Initialize chat when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthorized && user?.role === "Job Seeker" && !sessionActive) {
      startChat();
    }
  }, [isAuthorized, user, sessionActive]);

  const value = {
    isChatOpen,
    messages,
    isLoading,
    sessionActive,
    error,
    isOfflineMode,
    modelStatus,
    toggleChat,
    startChat,
    sendMessage,
    endChat,
    resetChat,
    checkModelStatus,
  };

  return (
    <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
  );
};
