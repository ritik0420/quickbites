import React, { useContext, useState, useEffect } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const frontend_url = "https://quickbites-nine.vercel.app";
const PlaceOrder = () => {

  const navigate = useNavigate();
  const { getTotalCartAmount, token, food_list, cartItems, url, userId,setCartItems,clearCart } = useContext(StoreContext);
  const [razorpayKey, setRazorpayKey] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  });

  useEffect(() => {
    const fetchRazorpayKey = async () => {
      try {
        const { data } = await axios.get(`${url}/api/config`);
        setRazorpayKey(data.razorpayKey);
      } catch (error) {
        console.error("Failed to load Razorpay key:", error);
      }
    };

    const loadRazorpayScript = () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => console.error("Failed to load Razorpay SDK");
      document.body.appendChild(script);
    };

    fetchRazorpayKey();
    loadRazorpayScript();
  }, [url]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };
  const verifyPayment = async (response) => {
    console.log("Payment Response from Razorpay:", response); // ✅ Log response
    const orderId = localStorage.getItem("current_order_id");
    if (!orderId) {
      console.error("Order ID is missing from local storage!");
      alert("Order ID not found. Please try placing the order again.");
      return;
    }
    try {
      const verifyData = {  // ✅ Add const here!
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        order_id: localStorage.getItem("current_order_id"),
      };

      console.log("Sending Verification Payload:", verifyData); // ✅ Log before sending

      const verifyRes = await axios.post(`${url}/api/payments/verify`, verifyData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Verification Response from Backend:", verifyRes.data); // ✅ Log backend response

      if (verifyRes.data.success) {
        alert("Payment Verified Successfully!");
        window.location.replace(`${window.location.origin}/verify?success=true&orderId=${response.razorpay_order_id}`);
      } else {
        alert("Payment Verification Failed!");
      }
    } catch (error) {
      console.error("Payment Verification Error:", error);
      alert("Error verifying payment!");
    }
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (!razorpayLoaded) {
      alert("Razorpay SDK is still loading. Please wait.");
      return;
    }

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        orderItems.push({ ...item, quantity: cartItems[item._id] });
      }
    });

    let totalAmountUSD = getTotalCartAmount() + 2;
    let totalAmountINR = Math.round(totalAmountUSD * 83);

    let orderData = {
      userId: userId,
      address: data,
      items: orderItems,
      amount: totalAmountINR,
    };

    try {
      let response = await axios.post(`${url}/api/orders/place`, orderData, { headers: { token } });

      if (response.data.success) {
        const { razorpayOrderId, mongoOrderId } = response.data;
        localStorage.setItem("mongo_order_id", mongoOrderId);
        localStorage.setItem("razorpay_order_id", razorpayOrderId);

        const options = {
          key: razorpayKey,
          amount: totalAmountINR * 100,
          currency: "INR",
          name: "Food Delivery",
          description: "Complete Your Order",
          order_id: razorpayOrderId,
          handler: function (paymentResponse) {
            console.log("✅ Razorpay Payment Success:", paymentResponse);

            if (!paymentResponse.razorpay_payment_id || !paymentResponse.razorpay_signature) {
              console.error("🚨 Missing payment details in Razorpay response!");
              alert("Payment details missing. Please contact support.");
              return;
            }

            localStorage.setItem("razorpay_payment_id", paymentResponse.razorpay_payment_id);
            localStorage.setItem("razorpay_signature", paymentResponse.razorpay_signature);

            verifyPayment(paymentResponse);
          },
          prefill: {
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            contact: data.phone
          },
          theme: { color: "#3399cc" }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        alert("Order placement failed!");
      }
    } catch (error) {
      console.error("Order Placement Error:", error.response ? error.response.data : error.message);
      alert("Error processing order");
    }
  };

  const handlePaymentSuccess = async (response) => {
    console.log("✅ Razorpay Payment Success:", response);
  
    if (!response.razorpay_payment_id || !response.razorpay_signature) {
      console.error("🚨 Missing payment details in Razorpay response!");
      alert("Payment details missing. Please contact support.");
      return;
    }
  
    // ✅ Save payment details in localStorage
    localStorage.setItem("razorpay_payment_id", response.razorpay_payment_id);
    localStorage.setItem("razorpay_signature", response.razorpay_signature);
  
    try {
      const paymentData = {
        mongo_order_id: localStorage.getItem("mongo_order_id"),
        razorpay_order_id: localStorage.getItem("razorpay_order_id"),
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      };
  
      console.log("🚀 Sending Payment Data to Backend:", paymentData);
  
      const res = await axios.post(`${url}/api/orders/updatePayment`, paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("✅ Payment Data Saved to Backend:", res.data);
  
      if (res.data.success) {
        // ✅ Clear cart both from Local Storage and React Context API
        clearCart();
        // ✅ Ensure state update is properly applied
        await new Promise((resolve) => setTimeout(resolve, 100)); // Force re-render
        // ✅ Navigate to Orders page AFTER clearing cart
        navigate("/myOrders");
      } else {
        alert("Payment verification failed!");
      }
    } catch (error) {
      console.error("🚨 Error saving payment details:", error);
      alert("Error processing payment!");
    }
  };
  

  return (
    <form onSubmit={handlePlaceOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input name='firstName' required onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' />
          <input name='lastName' required onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' />
        </div>
        <input name='email' required onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
        <input name='street' required onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
        <div className="multi-fields">
          <input name='city' required onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
          <input name='state' required onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
        </div>
        <div className="multi-fields">
          <input name='zipcode' required onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip code' />
          <input name='country' required onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
        </div>
        <input name='phone' required onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getTotalCartAmount() + 2}</b>
            </div>
          </div>
          <button type='submit' disabled={!razorpayLoaded}>
            {razorpayLoaded ? "Proceed to Payment" : "Loading Payment..."}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
