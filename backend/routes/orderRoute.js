import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { placeOrder, verifyOrder, getPaymentDetails, updatePayment, userOrders, listOrders, updateStatus } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post('/place', authMiddleware, placeOrder);
orderRouter.post('/verify',verifyOrder);
orderRouter.get('/:orderId/payment', getPaymentDetails);
orderRouter.post("/updatePayment", updatePayment);
orderRouter.post("/userorders",authMiddleware, userOrders );
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);

//http://localhost:4000/api/orders/userorders
//http://localhost:4000/api/user/login

export default orderRouter;