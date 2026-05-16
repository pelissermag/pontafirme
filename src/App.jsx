import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/globals.css';

// Public Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';

// Public Pages
import Home from './pages/Home';
import Players from './pages/Players';
import Photos from './pages/Photos';
import Videos from './pages/Videos';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import AdminPhotos from './pages/admin/Photos';
import AdminVideos from './pages/admin/Videos';
import AdminAbout from './pages/admin/About';
import AdminSponsors from './pages/admin/Sponsors';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="fotos" element={<AdminPhotos />} />
          <Route path="videos" element={<AdminVideos />} />
          <Route path="sobre" element={<AdminAbout />} />
          <Route path="patrocinadores" element={<AdminSponsors />} />
        </Route>

        {/* Public Routes */}
        <Route path="/*" element={
          <div className={`app-container ${isMobile ? 'mobile' : 'desktop'}`}>
            {!isMobile ? <Navbar /> : <TopBar />}
            
            <main className="content">
              <Routes>
                <Route path="/" element={<Home isMobile={isMobile} />} />
                <Route path="/jogadores" element={<Players isMobile={isMobile} />} />
                <Route path="/fotos" element={<Photos isMobile={isMobile} />} />
                <Route path="/videos" element={<Videos isMobile={isMobile} />} />
              </Routes>
            </main>

            {!isMobile ? <Footer /> : <BottomNav />}
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
