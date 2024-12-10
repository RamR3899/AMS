import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Header.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Header({ toggleMenu }) {
 const [dropdowns, setDropdowns] = useState({
 user: false,
 notifications: false,
 help: false,
 });

 const userRef = useRef(null);
 const notificationsRef = useRef(null);
 const helpRef = useRef(null);

 const handleClickOutside = useCallback((event) => {
 if (
 userRef.current && !userRef.current.contains(event.target) &&
 notificationsRef.current && !notificationsRef.current.contains(event.target) &&
 helpRef.current && !helpRef.current.contains(event.target)
 ) {
 setDropdowns({ user: false, notifications: false, help: false });
 }
 }, []);

 useEffect(() => {
 document.addEventListener('mousedown', handleClickOutside);
 return () => {
 document.removeEventListener('mousedown', handleClickOutside);
 };
 }, [handleClickOutside]);

 const toggleDropdown = (type) => {
 setDropdowns((prev) => ({
 ...prev,
 [type]: !prev[type],
 user: type === 'user' ? !prev.user : false,
 notifications: type === 'notifications' ? !prev.notifications : false,
 help: type === 'help' ? !prev.help : false,
 }));
 };

 return (
 <header className="header">
 <div className="left">
 <i className="fas fa-bars" onClick={toggleMenu} aria-label="Menu"></i>
 <i className="fas fa-briefcase"></i> Asset Management System
 </div>
 <div className="right">
 <span 
 className="notifications" 
 onClick={() => toggleDropdown('notifications')}
 aria-expanded={dropdowns.notifications}
 aria-controls="notifications-dropdown"
 ref={notificationsRef}
 >
 <i className="fas fa-bell"></i>
 </span>
 <span 
 className="help" 
 onClick={() => toggleDropdown('help')}
 aria-expanded={dropdowns.help}
 aria-controls="help-dropdown"
 title="Help"
 ref={helpRef}
 >
 <i className="fas fa-question-circle"></i>
 </span>
 <span 
 className="user" 
 onClick={() => toggleDropdown('user')}
 aria-expanded={dropdowns.user}
 aria-controls="user-dropdown"
 ref={userRef}
 >
 <i className="fas fa-user"></i>
 </span>
 {dropdowns.user && (
 <div id="user-dropdown" className="user-dropdown">
 <img className="user-avatar" src="https://img.icons8.com/?size=100&id=23265&format=png&color=000000" alt="User" />
 <div className="user-info">
 <strong>Visal</strong>
 <p>Visal@example.com</p>
 </div>
 <ul className="dropdown-menu">
 <li>Username</li>
 <li>Edit Profile</li>
 <li>Change Password</li>
 </ul>
 </div>
 )}
 {dropdowns.notifications && (
 <div id="notifications-dropdown" className="notifications-dropdown">
 <div className="notification-item">
 <i className="fas fa-info-circle"></i>
 <p>Your request is completed for the new laptop</p>
 </div>
 <div className="notification-item">
 <i className="fas fa-info-circle"></i>
 <p>System update available</p>
 </div>
 {/* Add more notifications as needed */}
 </div>
 )}
 {dropdowns.help && (
 <div id="help-dropdown" className="help-dropdown">
 <h4>Help & Support</h4>
 <p>Here you can find help and support options.</p>
 <ul>
 <li><a href="/faq">FAQ</a></li>
 <li><a href="/contact">Contact Support</a></li>
 <li><a href="/contact">7339091402</a></li>
 </ul>
 </div>
 )}
 </div>
 </header>
 );
}

export default Header;
