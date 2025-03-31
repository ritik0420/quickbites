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

const allowedOrigins = ["https://quickbites-three.vercel.app"];

// ✅ Middleware
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins, // Allow only your frontend domain
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // Allow cookies and headers
  })
);

//middleware
app.use(express.json())

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

