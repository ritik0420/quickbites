import express from "express";
import authMiddleware from "../middleware/auth.js";
import { razorpayInstance } from "../config/razorpay.js"; // ✅ Correct Import
import crypto from "crypto";

const paymentRouter = express.Router();

// Route to create a Razorpay order
paymentRouter.post("/order", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body; // Amount in INR

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `order_rcptid_${Math.random()}`,
    };

    const order = await razorpayInstance.orders.create(options); // ✅ Use razorpayInstance
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route to verify Razorpay payment
paymentRouter.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true, message: "Payment Verified" });
    } else {
      res.status(400).json({ success: false, message: "Invalid Signature" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default paymentRouter;
