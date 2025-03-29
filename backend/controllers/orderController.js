import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const frontend_url = "http://localhost:5173";

// **Placing an order using Razorpay**
const placeOrder = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      payment: false,
    });

    const savedOrder = await newOrder.save(); // ✅ Save order to MongoDB

    // ✅ Ensure `mongoOrderId` is correctly sent
    const options = {
      amount: req.body.amount * 100, // Amount in paisa
      currency: "INR",
      receipt: savedOrder._id.toString(),
    };

    const order = await razorpay.orders.create(options);

    // ✅ Update the order with the Razorpay ID
    savedOrder.razorpay_order_id = order.id;
    await savedOrder.save();

    res.json({
      success: true,
      mongoOrderId: savedOrder._id.toString(), // ✅ Ensure correct response
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error placing order" });
  }
};


const verifyOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing required fields!" });
    }

    // Generate HMAC SHA256 signature for verification
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed!" });
    }

    // ✅ Find the order by Razorpay Order ID instead of MongoDB _id
    const order = await orderModel.findOneAndUpdate(
      { razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        payment: true, // ✅ Mark payment as successful
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found!" });
    }

    console.log("✅ Payment Verified Successfully!");
    res.json({ success: true, message: "Payment verified successfully!", order });
  } catch (error) {
    console.error("🚨 Verification Error:", error);
    res.status(500).json({ success: false, message: "Server error while verifying payment!" });
  }
};


// ✅ New route to fetch payment details
const getPaymentDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    // ✅ Find the order using `razorpay_order_id` instead of `_id`
    const order = await orderModel.findOne({ razorpay_order_id: orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // ✅ Check if payment details exist before sending response
    if (!order.razorpay_order_id || !order.razorpay_payment_id || !order.razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment details missing for this order" });
    }

    res.json({
      success: true,
      razorpay_order_id: order.razorpay_order_id,
      razorpay_payment_id: order.razorpay_payment_id,
      razorpay_signature: order.razorpay_signature,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching payment details", error: error.message });
  }
};
const updatePayment = async (req, res) => {
  try {
    const { mongo_order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!mongo_order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing required fields!" });
    }


    const order = await orderModel.findByIdAndUpdate(
      mongo_order_id,
      {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        payment: true, 
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found!" });
    }

    await userModel.findByIdAndUpdate(order.userId, { cartData: {} });

    res.json({ success: true, message: "Payment updated successfully!", order });
  } catch (error) {
    console.error("🚨 Error updating payment:", error);
    res.status(500).json({ success: false, message: "Server error updating payment!" });
  }
};
//user orders for frontend
const userOrders = async (req, res) => {
try{
  const orders=await orderModel.find({userId:req.body.userId});
  res.json({success:true, data:orders});
}catch(error){
  console.log(error);
  res.json({success:false, message:"Error"});
}
}

//listing orders for admin panel

const listOrders =async(req,res)=>{
  try {
    const orders=await orderModel.find({});
    res.json({success:true, data:orders});
  } catch (error) {
    console.log(error);
    res.json({success:false, message:"Error"}); 
  }
}

//api for updating order status
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {status:req.body.status});
    res.json({ success: true, message: "Status updated successfully!" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating status!" });
  }
}


export { placeOrder, verifyOrder, getPaymentDetails, updatePayment, userOrders,listOrders,updateStatus };

