import { GoogleGenerativeAI } from "@google/generative-ai";
import {config} from "dotenv";
import path from "path";

config({
  path: path.resolve("config/config.env"), 
})
const API_KEY = process.env.GEMINI_API_KEY;



export const initGemini = () => {
  if (!API_KEY) {
    console.error("GEMINI_API_KEY is not defined in environment variables");
    return null;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    console.log("Gemini API initialized successfully");
    return genAI;
  } catch (error) {
    console.error("Error initializing Gemini API:", error);
    return null;
  }
};

// Configure Gemini model parameters
export const getGeminiModel = (genAI) => {
  if (!genAI) return null;
  
  try {
    // Try to get available models
    console.log("Attempting to use Gemini 2.0 Flash");
    
    // Use the correct model name from the documentation
    return genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    });
  } catch (error) {
    console.error("Error configuring Gemini model:", error);
    
    // Fallback to a different model if the first one fails
    try {
      console.log("Attempting to use gemini-pro");
      return genAI.getGenerativeModel({
        model: "gemini-pro",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      });
    } catch (fallbackError) {
      // Try one more model
      try {
        console.log("Attempting to use models/gemini-pro");
        return genAI.getGenerativeModel({
          model: "models/gemini-pro",
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        });
      } catch (finalError) {
        console.error("All model attempts failed:", finalError);
        return null;
      }
    }
  }
}; 