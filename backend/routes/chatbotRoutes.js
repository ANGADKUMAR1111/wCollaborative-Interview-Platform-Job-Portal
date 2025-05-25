import express from "express";
import { startChat, sendMessage, endChat, getFallbackResponseFromServer } from "../controllers/chatbotController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Routes for AI chatbot with authentication middleware
router.post("/start", isAuthenticated, startChat);
router.post("/message", isAuthenticated, sendMessage);
router.post("/end", isAuthenticated, endChat);
router.post("/fallback", getFallbackResponseFromServer);

export default router; 