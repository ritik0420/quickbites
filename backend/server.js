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
const port = 4000;

//middleware
const allowedOrigins = ["http://localhost:5173", "https://quickbites-three.vercel.app"];

app.use(express.json());

// ✅ Force CORS Headers for All Requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Temporarily allow all origins
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.json({ message: "CORS is working!" });

  // Handle Preflight Requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ✅ Enable CORS Middleware
app.use(cors({
  origin: allowedOrigins,
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));

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

app.get("/", (req,res) => {
   res.send("API WORKING fine")
})

app.listen(port, () =>{
    console.log(`Server is running on port ${port}`)
})

