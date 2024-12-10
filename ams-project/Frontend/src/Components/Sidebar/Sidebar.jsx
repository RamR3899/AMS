import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isVisible, onLogout, role }) {
  const [activeItem, setActiveItem] = useState('');
  const navigate = useNavigate();

  // Use useMemo to define menu items for each role
  const filteredMenuItems = useMemo(() => {
    const menuItems = {
      admin: [
        { name: 'My Assets', path: '/my-asset', icon: "https://img.icons8.com/?size=100&id=aALDS1fqMgrC&format=png&color=000000" },
        { name: 'Search Asset', path: '/search-asset', icon: "https://img.icons8.com/?size=100&id=KPmthqkeTgDN&format=png&color=000000" },
        { name: 'Inbox', path: '/inbox', icon: "https://img.icons8.com/?size=100&id=94498&format=png&color=000000" },
        { name: 'Assets', path: '/assets', icon: "https://img.icons8.com/?size=100&id=45918&format=png&color=000000" },
        { name: 'Dashboard', path: '/dashboard', icon: "https://img.icons8.com/?size=100&id=94505&format=png&color=000000" },
        { name: 'Settings', path: '/settings', icon: "https://img.icons8.com/?size=100&id=41617&format=png&color=000000" },
      ],
      storemanager: [
        { name: 'Inbox', path: '/inbox', icon: "https://img.icons8.com/?size=100&id=94498&format=png&color=000000" },
        { name: 'Assets', path: '/assets', icon: "https://img.icons8.com/?size=100&id=45918&format=png&color=000000" },
        { name: 'Dashboard', path: '/dashboard', icon: "https://img.icons8.com/?size=100&id=94505&format=png&color=000000" },
      ],
      user: [
        { name: 'My Assets', path: '/my-asset', icon: "https://img.icons8.com/?size=100&id=aALDS1fqMgrC&format=png&color=000000" },
        { name: 'Search Asset', path: '/search-asset', icon: "https://img.icons8.com/?size=100&id=KPmthqkeTgDN&format=png&color=000000" },
      ],
    };

    // Shared items for all roles
    const sharedItems = [
      { name: 'Sign out', path: '/login', icon: "https://img.icons8.com/?size=100&id=hCsrdxT04dZA&format=png&color=000000" }
    ];

    switch (role) {
      case 1:
        return [...menuItems.admin, ...sharedItems];
      case 2:
        return [...menuItems.storemanager, ...sharedItems];
      case 3:
        return [...menuItems.user, ...sharedItems];
      default:
        return sharedItems;
    }
  }, [role]);

  const handleItemClick = (item) => {
    if (item.name === 'Sign out') {
      onLogout();
      navigate('/login');
    } else {
      setActiveItem(item.name);
      navigate(item.path);
    }
  };

  return (
    <div className={`sidebar ${isVisible ? 'visible' : 'hidden'}`}>
      {filteredMenuItems.map((item) => (
        
        <div
          key={item.name}
          className={`sidebar-item ${activeItem === item.name ? 'active' : ''}`}
          onClick={() => handleItemClick(item)}
        > 
          <img className="sidebar-item-icon" src={item.icon} alt={`${item.name} Icon`} />
          {isVisible && <span className="sidebar-item-name">{item.name}</span>}
        </div>
      ))}
    </div>
  );
}

export default Sidebar;