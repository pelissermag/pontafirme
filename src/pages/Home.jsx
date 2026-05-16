import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, storageUrl } from '../lib/supabase';
import './Home.css';
import defaultLogo from '../assets/logo.png';

const Home = ({ isMobile }) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    hero_title: 'PONTA FIRME FC',
    hero_tagline: 'FORÇA, TRADIÇÃO E RAÇA NO FUTEBOL AMADOR',
    sobre_texto: '',
    club_logo: ''
  });
  const [latestPhotos, setLatestPhotos] = useState([]);
  const [latestVideos, setLatestVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Buscar Configurações
    const { data: settingsData } = await supabase.from('settings').select('*');
    if (settingsData) {
      const newSettings = { ...settings };
      settingsData.forEach(item => {
        newSettings[item.key] = item.value;
      });
      setSettings(newSettings);
    }

    // Buscar Últimas Fotos
    const { data: photosData } = await supabase
      .from('fotos')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(4);
    if (photosData) setLatestPhotos(photosData);

    // Buscar Últimos Vídeos
    const { data: videosData } = await supabase
      .from('videos')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(4);
    if (videosData) setLatestVideos(videosData);

    setLoading(false);
  };

  const currentLogo = settings.club_logo ? storageUrl('config', settings.club_logo) : defaultLogo;

  return (
    <div className="home-page reveal">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <img src={currentLogo} alt="Logo Ponta Firme FC" className="hero-logo" />
          <h1 className="hero-title">{settings.hero_title}</h1>
          <p className="hero-tagline">{settings.hero_tagline}</p>
          
          {settings.sobre_texto && (
            <div className="hero-about-container">
              <p className="hero-about-text">{settings.sobre_texto}</p>
            </div>
          )}

          <a href="/jogadores" className="cta-button">CONHEÇA O ELENCO</a>
        </div>
      </section>

      {/* Galeria Dinâmica: Últimas Fotos */}
      <section className="container section">
        <div className="section-header-flex">
          <h2 className="section-title">ÚLTIMAS FOTOS</h2>
          <a href="/fotos" className="view-all-link">Ver todas →</a>
        </div>
        <div className="home-media-grid">
          {latestPhotos.map(photo => (
            <div 
              key={photo.id} 
              className="home-media-card"
              onClick={() => navigate('/fotos', { state: { albumId: photo.id_evento } })}
              style={{ cursor: 'pointer' }}
            >
              <img src={storageUrl('fotos', photo.caminho_arquivo)} alt="Foto Recente" loading="lazy" />
            </div>
          ))}
          {latestPhotos.length === 0 && !loading && <p className="empty-msg">Nenhuma foto lançada ainda.</p>}
        </div>
      </section>

      {/* Galeria Dinâmica: Últimos Vídeos */}
      <section className="container section">
        <div className="section-header-flex">
          <h2 className="section-title">ÚLTIMOS VÍDEOS</h2>
          <a href="/videos" className="view-all-link">Ver todos →</a>
        </div>
        <div className="home-media-grid videos">
          {latestVideos.map(video => (
            <div 
              key={video.id} 
              className="home-media-card video"
              onClick={() => navigate('/videos', { state: { albumId: video.id_evento } })}
              style={{ cursor: 'pointer' }}
            >
              {video.thumbnail ? (
                <img src={storageUrl('videos', video.thumbnail)} alt="Thumbnail" />
              ) : video.tipo === 'arquivo' ? (
                <video 
                  src={`${storageUrl('videos', video.caminho_video)}#t=0.1`} 
                  preload="metadata" 
                  muted 
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div className="video-placeholder">🎬</div>
              )}
              <div className="play-overlay">▶</div>
            </div>
          ))}
          {latestVideos.length === 0 && !loading && <p className="empty-msg">Nenhum vídeo lançado ainda.</p>}
        </div>
      </section>
    </div>
  );
};

export default Home;
