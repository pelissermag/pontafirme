import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="logo-circle-small">PF</div>
          <span>ADMIN</span>
        </div>
        
        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
             Painel
          </NavLink>
          <NavLink to="/admin/fotos" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
             Fotos
          </NavLink>
          <NavLink to="/admin/videos" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
             Vídeos
          </NavLink>
          <NavLink to="/admin/sobre" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
             Sobre
          </NavLink>
          <NavLink to="/admin/patrocinadores" className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}>
             Patrocinadores
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">Sair</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h2 className="admin-page-title">Ponta Firme FC Dashboard</h2>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
