import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const Dashboard = () => {
  const [stats, setStats] = useState({
    photos: 0,
    videos: 0,
    players: 0,
    admins: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: photosCount },
        { count: videosCount },
        { count: playersCount },
        { count: adminsCount }
      ] = await Promise.all([
        supabase.from('eventos_fotos').select('*', { count: 'exact', head: true }),
        supabase.from('eventos_videos').select('*', { count: 'exact', head: true }),
        supabase.from('jogadores').select('*', { count: 'exact', head: true }),
        supabase.from('admins').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        photos: photosCount || 0,
        videos: videosCount || 0,
        players: playersCount || 0,
        admins: adminsCount || 0
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="stats-cards-grid">
        <div className="admin-card stat-card">
          <span className="stat-label">Álbuns de Fotos</span>
          <span className="stat-number">{stats.photos}</span>
        </div>
        <div className="admin-card stat-card">
          <span className="stat-label">Álbuns de Vídeos</span>
          <span className="stat-number">{stats.videos}</span>
        </div>
        <div className="admin-card stat-card">
          <span className="stat-label">Jogadores</span>
          <span className="stat-number">{stats.players}</span>
        </div>
        <div className="admin-card stat-card">
          <span className="stat-label">Administradores</span>
          <span className="stat-number">{stats.admins}</span>
        </div>
      </div>

      <div className="admin-card recent-activity">
        <h3>Atividade Recente</h3>
        <p style={{ color: '#666', marginTop: '16px' }}>Nenhuma atividade registrada hoje.</p>
      </div>
    </div>
  );
};

export default Dashboard;
