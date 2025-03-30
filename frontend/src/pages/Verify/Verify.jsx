import React, { useContext, useEffect, useState } from "react";
import "./Verify.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";

const Verify = () => {
  const { url, token, clearCart } = useContext(StoreContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      const success = searchParams.get("success"); // ✅ Get `success` from URL
      const orderId = searchParams.get("orderId"); // ✅ Get `orderId` from URL

      const razorpayOrderId = localStorage.getItem("razorpay_order_id");
      const razorpayPaymentId = localStorage.getItem("razorpay_payment_id");
      const razorpaySignature = localStorage.getItem("razorpay_signature");

      console.log("🔍 DEBUG: URL Params & LocalStorage Data:");
      console.log("URL success:", success);
      console.log("URL Order ID:", orderId);
      console.log("LocalStorage Razorpay Order ID:", razorpayOrderId);
      console.log("LocalStorage Razorpay Payment ID:", razorpayPaymentId);
      console.log("LocalStorage Razorpay Signature:", razorpaySignature);

      if (success !== "true" || !orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        alert("Missing or incorrect payment details. Redirecting...");
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
  }, [navigate, url, token, clearCart, searchParams]);

  return (
    <div className="verify">
      {loading ? <div className="spinner"></div> : <p>Redirecting...</p>}
    </div>
  );
};

export default Verify;
