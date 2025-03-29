import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.get('/config', (req, res) => {
  res.json({ razorpayKey: process.env.RAZORPAY_KEY_ID });
});

export default router;
