import { initGemini, getGeminiModel } from "../config/gemini.js";

const genAI = initGemini();
const model = genAI ? getGeminiModel(genAI) : null;

const chatHistory = new Map();

const MAX_HISTORY_LENGTH = 10;

const getJobSeekerContext = () => {
  return `You are an AI job assistant named "JobHelper" that specializes in helping job seekers. 
  Your goal is to provide helpful, accurate, and supportive advice on:
  - Resume writing and improvement
  - Job search strategies
  - Interview preparation 
  - Career development
  - Skill improvement suggestions
  - Job application best practices
  - Industry-specific advice when asked
  
  Always be supportive, professional, and empathetic. Remember that looking for jobs can be stressful.
  Provide factual information and avoid making up statistics or facts.
  Focus on being practical and actionable in your advice.
  If you don't know something, be honest and suggest reliable sources where appropriate.`;
};

function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('job') && (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('looking'))) {
    return "I'm currently in offline mode. When online, I can help you search for jobs that match your skills and experience. Try using the job search feature in the main dashboard instead.";
  }
  
  // Resume related queries
  if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
    return "I'm currently in offline mode. When online, I can provide tips on improving your resume. In the meantime, you might want to check out the profile section to update your professional information.";
  }
  
  // Interview preparation
  if (lowerMessage.includes('interview') || lowerMessage.includes('prepare')) {
    return "I'm currently in offline mode. When online, I can help you prepare for interviews with practice questions and tips. You can review common interview questions in the resources section of the platform.";
  }
  
  // Skills or learning
  if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('course')) {
    return "I'm currently in offline mode. When online, I can suggest skills to improve or courses to take based on your career goals. Check out the learning resources section for self-paced courses.";
  }
  
  // Application status
  if (lowerMessage.includes('application') || lowerMessage.includes('status') || lowerMessage.includes('applied')) {
    return "I'm currently in offline mode. When online, I can help you track your application status. You can manually check your applications in the 'My Applications' section.";
  }
  
  // Salary negotiation
  if (lowerMessage.includes('salary') || lowerMessage.includes('negotiat') || lowerMessage.includes('offer')) {
    return "I'm currently in offline mode. When online, I can provide salary negotiation tips. In the meantime, you might want to research industry standards for your position and location.";
  }
  
  // Default response
  return "I'm currently in offline mode due to connectivity issues. When I'm back online, I'll be able to assist you with job search, resume tips, interview preparation, and more. Please try again later or explore the platform's features manually.";
}

// Start a new chat for a user
export const startChat = async (req, res) => {
  try {
    // Get user ID from request body, or use a session ID if not available
    const userId = req.body.userId || req.user?._id || `session_${Date.now()}`;
    
    // Check if AI model is available
    if (!model) {
      console.warn("AI model not available, using fallback responses");
      
      // Initialize chat history even without a model
      if (!chatHistory.has(userId)) {
        chatHistory.set(userId, [
          { role: "system", parts: [{ text: getJobSeekerContext() }] },
          { role: "model", parts: [{ text: "Hi there! I'm JobHelper, your AI assistant for job search and career advice. How can I help you today?" }] }
        ]);
      }
      
      return res.status(200).json({
        success: true,
        message: "Chat session started (fallback mode)",
        greeting: "Hi there! I'm JobHelper, your AI assistant for job search and career advice. How can I help you today? (Note: I'm currently running in limited mode)"
      });
    }
    
    // Initialize chat for this user if it doesn't exist
    if (!chatHistory.has(userId)) {
      chatHistory.set(userId, [
        { role: "model", parts: [{ text: getJobSeekerContext() }] },
        { role: "model", parts: [{ text: "Hi there! I'm JobHelper, your AI assistant for job search and career advice. How can I help you today?" }] }
      ]);
    }
    
    return res.status(200).json({
      success: true,
      message: "Chat session started",
      greeting: "Hi there! I'm JobHelper, your AI assistant for job search and career advice. How can I help you today?"
    });
  } catch (error) {
    console.error("Error starting chat:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error starting chat session",
      error: error.message
    });
  }
};

// Process user message and get AI response
export const sendMessage = async (req, res) => {
  try {
    // Get user ID and message from request body
    const userId = req.body.userId || req.user?._id || `session_${Date.now()}`;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: "Message is required" 
      });
    }
    
    // Initialize chat for this user if it doesn't exist
    if (!chatHistory.has(userId)) {
      chatHistory.set(userId, [
        { role: "model", parts: [{ text: getJobSeekerContext() }] }
      ]);
    }
    
    // Get chat history for this user
    const history = chatHistory.get(userId);
    
    // Add user message to history
    history.push({ role: "user", parts: [{ text: message }] });
    
    // Check if AI model is available
    if (!model) {
      console.warn("Model not available, using fallback response");
      const fallbackResponse = getFallbackResponse(message);
      
      // Add fallback response to history
      history.push({ role: "model", parts: [{ text: fallbackResponse }] });
      
      return res.status(200).json({
        success: true,
        message: "Fallback response provided",
        response: fallbackResponse
      });
    }
    
    try {
      console.log("Attempting to create chat session with model");
      // Create a chat session with history
      const chat = model.startChat({
        history: history.slice(0, -1), // Use history except the latest user message
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      });
      
      console.log("Sending message to model: ", message.substring(0, 50) + (message.length > 50 ? "..." : ""));
      // Get response from AI
      const result = await chat.sendMessage(message);
      const aiResponse = result.response.text();
      
      console.log("Got response from model, length: ", aiResponse.length);
      
      // Add AI response to history
      history.push({ role: "model", parts: [{ text: aiResponse }] });
      
      // Keep history within limits
      if (history.length > MAX_HISTORY_LENGTH) {
        // Keep the first message (system prompt) and remove oldest messages
        const systemPrompt = history[0];
        chatHistory.set(userId, [systemPrompt, ...history.slice(history.length - MAX_HISTORY_LENGTH + 1)]);
      }
      
      return res.status(200).json({
        success: true,
        message: "Message processed successfully",
        response: aiResponse
      });
    } catch (aiError) {
      console.error("Error getting AI response:", aiError);
      
      // Specific error handling based on error type
      let fallbackResponse;
      
      if (aiError.message && aiError.message.includes("models/")) {
        // Model not found or API version issue
        fallbackResponse = "I'm experiencing technical difficulties with my AI service. Our team has been notified and is working on a fix. I can still provide some basic assistance in offline mode.";
        console.error("Model configuration error:", aiError.message);
      } else if (aiError.message && aiError.message.includes("quota")) {
        // Quota exceeded
        fallbackResponse = "I've reached my usage limit for the moment. Please try again in a little while or use my offline assistance capabilities.";
      } else {
        // General error
        fallbackResponse = "I'm sorry, I'm having trouble processing your request right now. Could you try again later or rephrase your question?";
      }
      
      // Add fallback response to history
      history.push({ role: "model", parts: [{ text: fallbackResponse }] });
      
      return res.status(200).json({
        success: true,
        message: "Fallback response provided due to AI error",
        response: fallbackResponse
      });
    }
  } catch (error) {
    console.error("Error processing message:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process message",
      error: error.message
    });
  }
};

// End chat session for a user
export const endChat = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?._id || `session_${Date.now()}`;
    
    // Clear chat history for this user if it exists
    if (chatHistory.has(userId)) {
      chatHistory.delete(userId);
    }
    
    return res.status(200).json({
      success: true,
      message: "Chat session ended"
    });
  } catch (error) {
    console.error("Error ending chat:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error ending chat session",
      error: error.message
    });
  }
};

// Provide fallback response for frontend when in offline mode
export const getFallbackResponseFromServer = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: "Message is required" 
      });
    }
    
    const fallbackResponse = getFallbackResponse(message);
    
    return res.status(200).json({
      success: true,
      message: "Fallback response provided",
      response: fallbackResponse
    });
  } catch (error) {
    console.error("Error generating fallback response:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate fallback response",
      error: error.message
    });
  }
}; 