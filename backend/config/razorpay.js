import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// ✅ Create and export the Razorpay instance properly
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export { razorpayInstance }; // ✅ Correct ESM export
