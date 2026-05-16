import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getEventosFotos, getFotosByEvento } from '../lib/queries';
import { storageUrl } from '../lib/supabase';
import './Photos.css';

const Photos = ({ isMobile }) => {
  const location = useLocation();
  const [eventos, setEventos] = useState([]);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
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

  // Trava o scroll da página quando o lightbox está aberto
  useEffect(() => {
    if (selectedPhotoIndex !== null) {
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
  }, [selectedPhotoIndex]);

  const fetchEventos = async () => {
    const { data, error } = await getEventosFotos();
    if (data) setEventos(data);
    setLoading(false);
  };

  const handleEventoClick = async (evento) => {
    setSelectedEvento(evento);
    setLoading(true);
    const { data, error } = await getFotosByEvento(evento.id);
    if (data) setPhotos(data);
    setLoading(false);
  };

  const handleBack = () => {
    setSelectedEvento(null);
    setPhotos([]);
  };

  const openLightbox = (index) => {
    setSelectedPhotoIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    if (selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    } else {
      setSelectedPhotoIndex(0); // Volta para a primeira
    }
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    if (selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    } else {
      setSelectedPhotoIndex(photos.length - 1); // Vai para a última
    }
  };

  return (
    <div className="photos-page reveal">
      <header className="page-header container">
        <h1 className="page-title">GALERIA</h1>
        <p className="page-subtitle">{selectedEvento ? selectedEvento.nome_evento : 'MEMÓRIAS DO CLUBE'}</p>
        {selectedEvento && (
          <button className="back-btn" onClick={handleBack}>&larr; Voltar aos Álbuns</button>
        )}
      </header>

      {loading && <div className="loading container">Carregando...</div>}

      {!selectedEvento ? (
        <div className="eventos-grid container">
          {eventos.map(evento => (
            <div key={evento.id} className="evento-card" onClick={() => handleEventoClick(evento)}>
              <div className="evento-cover">
                {/* Nome correto da coluna: capa */}
                <img src={storageUrl('fotos', evento.capa)} alt={evento.nome_evento} />
                <div className="photo-count">{evento.fotos?.[0]?.count || 0} fotos</div>
              </div>
              <div className="evento-info">
                <h3 className="evento-title">{evento.nome_evento}</h3>
                <span className="evento-date">{new Date(evento.data_evento).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="photos-grid container">
          {photos.map((photo, index) => (
            <div key={photo.id} className="photo-card" onClick={() => openLightbox(index)}>
              {/* Nome correto da coluna: caminho_arquivo */}
              <img src={storageUrl('fotos', photo.caminho_arquivo)} alt="Galeria" />
            </div>
          ))}
        </div>
      )}

      {selectedPhotoIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="close-lightbox" onClick={closeLightbox}>&times;</button>
          
          <button className="nav-btn prev" onClick={prevPhoto}>&#10094;</button>
          
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img 
              /* Nome correto da coluna: caminho_arquivo */
              src={storageUrl('fotos', photos[selectedPhotoIndex].caminho_arquivo)} 
              alt="Lightbox" 
            />
          </div>

          <button className="nav-btn next" onClick={nextPhoto}>&#10095;</button>
        </div>
      )}
    </div>
  );
};

export default Photos;
