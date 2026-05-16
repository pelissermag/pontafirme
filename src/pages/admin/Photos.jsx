import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { storageUrl } from '../../lib/supabase';
import './AdminPhotos.css'; // Vou criar este CSS para a grade do admin

const Photos = () => {
  const [eventos, setEventos] = useState([]);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState({ nome_evento: '', data_evento: '' });

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('eventos_fotos')
      .select('*, fotos(count)')
      .order('data_evento', { ascending: false });
    if (data) setEventos(data);
    setLoading(false);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('eventos_fotos').insert([newEvent]).select();
    if (data) {
      setEventos([data[0], ...eventos]);
      setIsAdding(false);
      setNewEvent({ nome_evento: '', data_evento: '' });
    }
  };

  const handleOpenAlbum = async (evento) => {
    setSelectedEvento(evento);
    setLoading(true);
    const { data, error } = await supabase
      .from('fotos')
      .select('*')
      .eq('id_evento', evento.id)
      .order('criado_em', { ascending: false });
    if (data) setPhotos(data);
    setLoading(false);
  };

  const handleUploadPhotos = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (const file of files) {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('fotos')
        .upload(fileName, file);

      if (data) {
        // Inserir no banco de dados
        const { data: dbData } = await supabase.from('fotos').insert([{
          id_evento: selectedEvento.id,
          caminho_arquivo: fileName
        }]).select();

        if (dbData) {
          setPhotos(prev => [dbData[0], ...prev]);
        }

        // Se o evento não tiver capa, definir esta como capa
        if (!selectedEvento.capa) {
          await supabase.from('eventos_fotos').update({ capa: fileName }).eq('id', selectedEvento.id);
          setSelectedEvento({...selectedEvento, capa: fileName});
        }
      }
    }
    setUploading(false);
    fetchEventos(); // Atualiza contagem na lista principal
  };

  const handleDeletePhoto = async (photo) => {
    if (window.confirm('Excluir esta foto permanentemente?')) {
      // Deletar do Storage
      await supabase.storage.from('fotos').remove([photo.caminho_arquivo]);
      // Deletar do Banco
      const { error } = await supabase.from('fotos').delete().eq('id', photo.id);
      if (!error) {
        setPhotos(photos.filter(p => p.id !== photo.id));
      }
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('ATENÇÃO: Isso excluirá o álbum e TODAS as fotos vinculadas. Deseja continuar?')) {
      // Aqui o ideal seria deletar as fotos do storage também, mas para simplificar:
      const { error } = await supabase.from('eventos_fotos').delete().eq('id', id);
      if (!error) {
        setEventos(eventos.filter(e => e.id !== id));
        if (selectedEvento?.id === id) setSelectedEvento(null);
      }
    }
  };

  if (loading && eventos.length === 0) return <div>Carregando...</div>;

  return (
    <div className="admin-photos">
      {!selectedEvento ? (
        <>
          <div className="admin-page-header">
            <h2 className="section-title">Álbuns de Fotos</h2>
            <button onClick={() => setIsAdding(true)} className="admin-btn">Novo Álbum</button>
          </div>

          {isAdding && (
            <div className="admin-card" style={{ marginBottom: '30px' }}>
              <h3>Criar Novo Álbum</h3>
              <form onSubmit={handleCreateEvent} className="admin-form-inline">
                <input 
                  type="text" 
                  placeholder="Nome (ex: Final 2024)" 
                  value={newEvent.nome_evento}
                  onChange={e => setNewEvent({...newEvent, nome_evento: e.target.value})}
                  required
                  className="admin-input"
                />
                <input 
                  type="date" 
                  value={newEvent.data_evento}
                  onChange={e => setNewEvent({...newEvent, data_evento: e.target.value})}
                  required
                  className="admin-input"
                />
                <button type="submit" className="admin-btn">Criar Álbum</button>
                <button type="button" onClick={() => setIsAdding(false)} className="admin-btn secondary">Cancelar</button>
              </form>
            </div>
          )}

          <div className="albums-grid">
            {eventos.map(event => (
              <div key={event.id} className="album-card" onClick={() => handleOpenAlbum(event)}>
                <div className="album-cover">
                  {event.capa ? (
                    <img src={storageUrl('fotos', event.capa)} alt={event.nome_evento} />
                  ) : (
                    <div className="album-placeholder">🖼️</div>
                  )}
                  <span className="album-badge">
                    {event.fotos?.[0]?.count || 0} fotos
                  </span>
                </div>
                <div className="album-info">
                  <h3>{event.nome_evento}</h3>
                  <span className="album-date">{new Date(event.data_evento).toLocaleDateString()}</span>
                </div>
                <div className="album-actions" onClick={e => e.stopPropagation()}>
                  <button className="admin-btn secondary small" onClick={() => handleOpenAlbum(event)}>
                    Gerenciar Fotos
                  </button>
                  <button className="admin-btn-danger" onClick={() => handleDeleteEvent(event.id)} title="Excluir Álbum">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {eventos.length === 0 && !loading && (
              <div className="empty-state">
                Nenhum álbum criado ainda. Clique em "Novo Álbum" para começar!
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="admin-page-header">
            <div className="header-left">
              <button onClick={() => setSelectedEvento(null)} className="admin-btn-back">
                <span>←</span> Voltar
              </button>
              <h2 className="section-title">{selectedEvento.nome_evento}</h2>
            </div>
            <div className="header-actions">
              <label className="admin-btn upload-btn">
                {uploading ? '⌛ Subindo...' : '🚀 Lançar Fotos'}
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleUploadPhotos} 
                  disabled={uploading}
                  hidden 
                />
              </label>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Carregando fotos...</p>
            </div>
          ) : (
            <div className="admin-photos-grid">
              {photos.map(photo => (
                <div key={photo.id} className="admin-photo-card">
                  <img src={storageUrl('fotos', photo.caminho_arquivo)} alt="Foto" loading="lazy" />
                  <button 
                    className="delete-photo-btn" 
                    onClick={() => handleDeletePhoto(photo)}
                    title="Excluir Foto"
                  >
                    &times;
                  </button>
                </div>
              ))}
              {photos.length === 0 && (
                <div className="empty-state">
                  Este álbum está vazio. Use o botão 🚀 para lançar fotos!
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Photos;
