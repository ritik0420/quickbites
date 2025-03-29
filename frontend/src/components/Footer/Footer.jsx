import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
const Footer = () => {
  return (
    <div className='footer' id='footer'>
<div className="footer-content">
    <div className="footer-content-left">
<img className='footer-logo' src={assets.logo} alt="" />
<p>Choose from a diverse menu featuring a array of dishes crafted with the finest ingredients and culinary expertise.</p>
<div className="footer-social-icons">
    <img src={assets.facebook_icon} alt="" />
    <img src={assets.twitter_icon} alt="" />
    <img src={assets.linkedin_icon} alt="" />
</div>
    </div>
    <div className="footer-content-center">
<h2>COMPANY</h2>
<ul>
    <li>Home</li>
    <li>About us</li>
    <li>Delivery</li>
    <li>Privacy policy</li>
</ul>
    </div>
    <div className="footer-content-right">
<h2>GET IN TOUCH</h2>
<ul>
    <li>+-123456789</li>
    <li>contact@ritik.kaintura007@gmail.com</li>
</ul>
    </div>
</div>
<hr/>
<p className='footer-copyright'>Copyright 2025 ©
QuickBites.com-All Rights Reserved.</p>
    </div>
  )
}

export default Footer