import express from "express";
import { getAvailableModels } from "../controllers/utilsController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Routes for utility functions
router.get("/check-models", isAuthenticated, getAvailableModels);

export default router; 