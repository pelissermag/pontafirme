import React, { useState, useEffect } from 'react';
import { supabase, storageUrl } from '../lib/supabase';
import defaultLogo from '../assets/logo.png';
import './TopBar.css';

const TopBar = () => {
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
    <header className="topbar">
      <div className="topbar-logo">
        <img src={logo} alt="Logo" className="topbar-logo-img" />
      </div>
      <h1 className="topbar-title">PONTA FIRME</h1>
      <div className="topbar-spacer"></div>
    </header>
  );
};

export default TopBar;
