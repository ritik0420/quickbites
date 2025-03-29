import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import foodRouter from "./routes/foodRoute.js";
import userRouter from './routes/userRoute.js';
import 'dotenv/config';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import paymentRouter from './routes/payment.js';
import configRoute from './routes/configRoute.js';

//app config
const app = express();

//middleware
app.use(express.json());
app.use(cors());

//db connection
connectDB();

//api endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentRouter);
app.use("/api", configRoute);

app.get("/", (req, res) => {
    res.send("API WORKING fine");
});

// Export the app for Vercel
export default app;
