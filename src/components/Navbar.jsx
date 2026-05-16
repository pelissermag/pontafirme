import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { supabase, storageUrl } from '../lib/supabase';
import defaultLogo from '../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  const [logo, setLogo] = useState(defaultLogo);

  useEffect(() => {
    const fetchLogo = async () => {
      const { data } = await supabase.from('settings').select('*').eq('key', 'club_logo').single();
      if (data && data.value) {
        setLogo(storageUrl('config', data.value));
      }
    };
    fetchLogo();
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <div className="logo">
          <img src={logo} alt="PF Logo" className="navbar-logo-img" />
          <span className="logo-text">PONTA FIRME</span>
        </div>
        
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            INÍCIO
          </NavLink>
          <NavLink to="/jogadores" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            JOGADORES
          </NavLink>
          <NavLink to="/fotos" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            FOTOS
          </NavLink>
          <NavLink to="/videos" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            VÍDEOS
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
