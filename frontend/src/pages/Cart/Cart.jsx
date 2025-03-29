import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, food_list, removeFromCart, addToCart, getTotalCartAmount, url, token } = useContext(StoreContext);
  
  const totalAmount = getTotalCartAmount();
  const isCartEmpty = totalAmount === 0;
  const isUserLoggedIn = !!token; // Check if user is logged in
  const navigate = useNavigate();

  const handleAuthCheck = () => {
    alert("Please log in to continue.");
  };

  const handleCheckout = () => {
    if (!isUserLoggedIn) {
      alert("You need to log in before proceeding to checkout.");
    } else {
      navigate('/order');
    }
  };

  return (
    <div className='cart'>
      <div className='cart-items'>
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
        </div>
        <br />
        <hr />
        
        {isCartEmpty ? (
          <p className="empty-cart-message">Your cart is empty</p>
        ) : (
          food_list.map((item) => {
            if (cartItems[item._id] > 0) {
              return (
                <div key={item._id}>
                  <div className='cart-items-title cart-items-item'>
                    <img src={url+"/images/"+item.image} alt="" />
                    <p>{item.name}</p>
                    <p>${item.price}</p>

                    <div className="quantity-control">
                      <button 
                        onClick={() => isUserLoggedIn ? removeFromCart(item._id) : handleAuthCheck()}
                        disabled={!isUserLoggedIn}
                      >-</button>
                      <p>{cartItems[item._id]}</p>
                      <button 
                        onClick={() => isUserLoggedIn ? addToCart(item._id) : handleAuthCheck()}
                        disabled={!isUserLoggedIn}
                      >+</button>
                    </div>
                    <p>${item.price * cartItems[item._id]}</p>
                  </div>
                  <hr />
                </div>
              );
            }
          })
        )}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${totalAmount}</p>
            </div>

            {!isCartEmpty && (
              <>
                <div className="cart-total-details">
                  <p>Delivery Fee</p>
                  <p>${2}</p>
                </div>
                <div className="cart-total-details">
                  <b>Total</b>
                  <b>${totalAmount + 2}</b>
                </div>
              </>
            )}
          </div>

          <button 
            onClick={handleCheckout} 
            disabled={isCartEmpty} 
            className={isCartEmpty ? "disabled-button" : ""}
          >
            Proceed to Checkout
          </button>
        </div>

        {!isCartEmpty && (
          <div className="cart-promocode">
            <div>
              <p>If you have a promo code, Enter it here</p>
              <div className="cart-promocode-input">
                <input type="text" placeholder='Promo code' />
                <button disabled={!isUserLoggedIn} onClick={handleAuthCheck}>Apply</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
