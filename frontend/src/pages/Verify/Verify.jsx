import React, { useContext, useEffect, useState } from "react";
import "./Verify.css";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios"; // ✅ Import axios

const Verify = () => {
  const { url, token, clearCart,removeFromCart } = useContext(StoreContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      const mongoOrderId = localStorage.getItem("mongo_order_id"); 
      const razorpayOrderId = localStorage.getItem("razorpay_order_id");
      const razorpayPaymentId = localStorage.getItem("razorpay_payment_id");
      const razorpaySignature = localStorage.getItem("razorpay_signature");
  
      console.log("🔍 DEBUG: LocalStorage Data:");
      console.log("MongoDB Order ID:", mongoOrderId);
      console.log("Razorpay Order ID:", razorpayOrderId);
      console.log("Razorpay Payment ID:", razorpayPaymentId);
      console.log("Razorpay Signature:", razorpaySignature);
  
      if (!mongoOrderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        alert("Missing payment details. Redirecting...");
        navigate("/cart");
        return;
      }
  
      try {
        const paymentData = {
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        };
  
        console.log("🚀 Sending Verification Payload:", paymentData);
  
        const verifyRes = await axios.post(`${url}/api/orders/verify`, paymentData, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log("🔍 Verification Response:", verifyRes.data);
  
        if (verifyRes.data.success) {
          clearCart();
          navigate("/myOrders");
        } else {
          alert("❌ Payment Verification Failed!");
          navigate("/cart");
        }
      } catch (error) {
        console.error("🚨 Payment Verification Error:", error);
        alert("⚠️ Error verifying payment!");
        navigate("/cart");
      }
    };
  
    verifyPayment();
  }, [navigate, url, token, clearCart]);
  

  return (
    <div className="verify">
      {loading ? <div className="spinner"></div> : <p>Redirecting...</p>}
    </div>
  );
};

export default Verify;
