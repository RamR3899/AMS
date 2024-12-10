import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Header from './Components/Header/Header.jsx';
import Sidebar from './Components/Sidebar/Sidebar.jsx';
import MyAsset from './Components/MyAsset/MyAssets.jsx';
import SearchAsset from './Components/SearchAsset/SearchAsset.jsx';
import Inbox from './Components/Inbox/Inbox.jsx';
import Assets from './Components/Assets/Assets.jsx';
import Settings from './Components/Settings/Settings.jsx';
import Dashboard from './Components/Dashboard/Dashboard.jsx';
import Login from './Components/Login/Login.jsx';
import './App.css';

function App() {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isAuthChecked, setAuthChecked] = useState(false);
  const [role, setRole] = useState('');
  const [initialPath, setInitialPath] = useState('/login');
  const navigate = useNavigate();

  const toggleMenu = () => setSidebarVisible(!isSidebarVisible);

  const handleLogin = (status, userRole) => {
    setAuthenticated(status);
    setRole(userRole);
    if (status) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('role', userRole);

      let path = '/login';
      switch (userRole) {
        case 1: // Admin
          path = '/my-asset';
          break;
        case 2: // Store Manager
          path = '/inbox';
          break;
        case 3: // User
          path = '/my-asset';
          break;
        default:
          path = '/login';
          break;
      }
      setInitialPath(path);
      navigate(path);
    } else {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('role');
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setSidebarVisible(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('role');
    navigate('/login');
  };

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const storedRole = localStorage.getItem('role');
    if (authStatus === 'true') {
      setAuthenticated(true);
      setRole(parseInt(storedRole));
      let path = '/login';
      switch (parseInt(storedRole)) {
        case 1: // Admin
          path = '/my-asset';
          break;
        case 2: // Store Manager
          path = '/inbox';
          break;
        case 3: // User
          path = '/my-asset';
          break;
        default:
          path = '/login';
          break;
      }
      setInitialPath(path);
    }
    setAuthChecked(true);
  }, []);

  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.setItem('currentPath', location.pathname);
    }
  }, [location.pathname, isAuthenticated]);

  const currentPath = sessionStorage.getItem('currentPath') || initialPath;

  if (!isAuthChecked) return <div>Loading...</div>;

  return (
    <div className="app">
      {isAuthenticated && location.pathname !== '/login' && <Header toggleMenu={toggleMenu} />}
      <div className="main-content">
        {isAuthenticated && location.pathname !== '/login' && (
          <Sidebar
            isVisible={isSidebarVisible}
            onLogout={handleLogout}
            role={role}
          />
        )}
        <div className={`content ${isSidebarVisible ? 'sidebar-visible' : 'sidebar-hidden'}`}>
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/" element={isAuthenticated ? <Navigate to={currentPath} /> : <Navigate to="/login" />} />
            {role === 1 && ( // Admin
              <>
                <Route path="/my-asset" element={<MyAsset />} />
                <Route path="/search-asset" element={<SearchAsset />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
              </>
            )}
            {role === 2 && ( // Store Manager
              <>
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </>
            )}
            {role === 3 && ( // User
              <>
                <Route path="/my-asset" element={<MyAsset />} />
                <Route path="/search-asset" element={<SearchAsset />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
}

function AppWithRouter() {
  return (
    <Router>  
      <App />
    </Router>
  );
}

export default AppWithRouter;