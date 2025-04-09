import React, { useContext, useEffect, useState } from "react";
import "./Verify.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Verify = () => {
  const { url, token, clearCart } = useContext(StoreContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      const success = searchParams.get("success");
      const orderId = searchParams.get("orderId");

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
        toast.error("Missing or incorrect payment details. Redirecting...");
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
          toast.success("✅ Payment Verified!");
          clearCart();
          navigate("/myOrders");
        } else {
          toast.error("❌ Payment Verification Failed!");
          navigate("/cart");
        }
      } catch (error) {
        console.error("🚨 Payment Verification Error:", error);
        toast.error("⚠️ Error verifying payment!");
        navigate("/cart");
      }
    };

    verifyPayment();
  }, [navigate, url, token, clearCart, searchParams]);

  return (
    <div className="verify">
      <ToastContainer />
      {loading ? <div className="spinner"></div> : <p>Redirecting...</p>}
    </div>
  );
};

export default Verify;
