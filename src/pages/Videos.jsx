import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getEventosVideos, getVideosByEvento } from '../lib/queries';
import { storageUrl } from '../lib/supabase';
import './Videos.css';

const Videos = ({ isMobile }) => {
  const location = useLocation();
  const [eventos, setEventos] = useState([]);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [videos, setVideos] = useState([]);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventos();
  }, []);

  // Verificar se veio um albumId via navegação (vindo da Home)
  useEffect(() => {
    if (location.state?.albumId && eventos.length > 0) {
      const album = eventos.find(e => e.id === location.state.albumId);
      if (album) {
        handleEventoClick(album);
        // Limpa o estado para não reabrir se o usuário voltar
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, eventos]);

  // Trava o scroll da página quando o player está aberto
  useEffect(() => {
    if (playingVideo) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('media-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('media-open');
    }
    return () => { 
      document.body.style.overflow = 'unset';
      document.body.classList.remove('media-open');
    };
  }, [playingVideo]);

  const fetchEventos = async () => {
    const { data, error } = await getEventosVideos();
    if (data) setEventos(data);
    setLoading(false);
  };

  const handleEventoClick = async (evento) => {
    setSelectedEvento(evento);
    setLoading(true);
    const { data, error } = await getVideosByEvento(evento.id);
    if (data) setVideos(data);
    setLoading(false);
  };

  const handleBack = () => {
    setSelectedEvento(null);
    setVideos([]);
  };

  const getVideoSrc = (video) => {
    if (video.tipo === 'link') return video.caminho_video;
    return storageUrl('videos', video.caminho_video);
  };

  return (
    <div className="videos-page reveal">
      <header className="page-header container">
        <h1 className="page-title">VÍDEOS</h1>
        <p className="page-subtitle">{selectedEvento ? selectedEvento.nome_evento : 'COBERTURA COMPLETA'}</p>
        {selectedEvento && (
          <button className="back-btn" onClick={handleBack}>&larr; Voltar aos Álbuns</button>
        )}
      </header>

      {loading && <div className="loading container">Carregando...</div>}

      {!selectedEvento ? (
        <div className="eventos-grid container">
          {eventos.map(evento => (
            <div key={evento.id} className="video-card large" onClick={() => handleEventoClick(evento)}>
              <div className="video-thumbnail">
                {evento.capa_video ? (
                  <img src={storageUrl('videos', evento.capa_video)} alt={evento.nome_evento} />
                ) : (
                  // Fallback para o primeiro vídeo do álbum
                  evento.videos?.[0] ? (
                    evento.videos[0].thumbnail ? (
                      <img src={storageUrl('videos', evento.videos[0].thumbnail)} alt={evento.nome_evento} />
                    ) : evento.videos[0].tipo === 'arquivo' ? (
                      <video 
                        src={`${storageUrl('videos', evento.videos[0].caminho_video)}#t=0.1`} 
                        preload="metadata" 
                        muted 
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="video-placeholder">▶</div>
                    )
                  ) : (
                    <div className="video-placeholder">▶</div>
                  )
                )}
                <div className="video-count">{evento.videos?.length || 0} vídeos</div>
              </div>
              <div className="video-body">
                <h3 className="video-title">{evento.nome_evento}</h3>
                <span className="video-date">{new Date(evento.data_evento).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="videos-grid container">
          {videos.map(video => (
            <div key={video.id} className="video-card" onClick={() => setPlayingVideo(video)}>
              <div className="video-thumbnail">
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
                  <div className="play-button small">▶</div>
                )}
                <span className="video-type-tag">{video.tipo === 'link' ? 'LINK' : 'MP4'}</span>
              </div>
              <div className="video-body">
                <h3 className="video-title">Assistir Vídeo</h3>
                <span className="video-date">{new Date(video.criado_em).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {playingVideo && (
        <div className="video-player-overlay" onClick={() => setPlayingVideo(null)}>
          <button className="close-player" onClick={() => setPlayingVideo(null)}>&times;</button>
          <div className="player-container" onClick={e => e.stopPropagation()}>
             {playingVideo.tipo === 'link' ? (
                <iframe 
                  src={playingVideo.caminho_video.includes('youtube.com') 
                    ? playingVideo.caminho_video.replace('watch?v=', 'embed/') 
                    : playingVideo.caminho_video} 
                  title="Video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
             ) : (
                <video 
                  controls 
                  autoPlay 
                  playsInline
                  webkit-playsinline="true"
                  src={getVideoSrc(playingVideo)}
                ></video>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
