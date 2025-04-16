import express from "express";
import {
  initializePayment,
  handlePaymentCallback,
} from "../controllers/paymentController.js";

const router = express.Router();

// Initialize payment
router.post("/initialize", initializePayment);

// Handle payment callback
router.post("/callback", handlePaymentCallback);

export default router;
