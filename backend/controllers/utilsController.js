import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({
    path: "../config/config.env"
});

// Access the API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY ;

// Get list of available models
export const getAvailableModels = async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(400).json({
        success: false,
        message: "API key is not configured"
      });
    }
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Execute a simple test query to check connectivity
    try {
      console.log("Trying gemini-2.0-flash...");
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent("Hello");
      const text = result.response.text();
      
      return res.status(200).json({
        success: true,
        message: "Successfully connected to Gemini API",
        testResponse: text.substring(0, 100),
        suggestedModel: "gemini-2.0-flash"
      });
    } catch (error1) {
      console.log("First model failed, trying alternative:", error1.message);
      
      try {
        console.log("Trying gemini-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        const text = result.response.text();
        
        return res.status(200).json({
          success: true,
          message: "Successfully connected to Gemini API using alternative model name",
          testResponse: text.substring(0, 100),
          suggestedModel: "gemini-pro"
        });
      } catch (error2) {
        console.log("Second model failed, trying another alternative:", error2.message);
        
        try {
          console.log("Trying models/gemini-pro...");
          const model = genAI.getGenerativeModel({ model: "models/gemini-pro" });
          const result = await model.generateContent("Hello");
          const text = result.response.text();
          
          return res.status(200).json({
            success: true,
            message: "Successfully connected to Gemini API using version-specific model name",
            testResponse: text.substring(0, 100),
            suggestedModel: "models/gemini-pro"
          });
        } catch (error3) {
          console.log("All standard models failed, trying one more option...");
          
          try {
            // Try the full path model name from the API documentation
            console.log("Trying full path model name...");
            const modelFullPath = "models/gemini-2.0-flash";
            const model = genAI.getGenerativeModel({ model: modelFullPath });
            const result = await model.generateContent("Hello");
            const text = result.response.text();
            
            return res.status(200).json({
              success: true,
              message: "Successfully connected using full path model name",
              testResponse: text.substring(0, 100),
              suggestedModel: modelFullPath
            });
          } catch (error4) {
            // If nothing works, return all error messages for debugging
            return res.status(400).json({
              success: false,
              message: "All model variants failed",
              errors: [
                error1.message,
                error2.message,
                error3.message,
                error4.message
              ]
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking models:", error);
    return res.status(500).json({
      success: false,
      message: "Server error checking models",
      error: error.message
    });
  }
}; 