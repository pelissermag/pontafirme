import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { storageUrl } from '../../lib/supabase';
import './AdminVideos.css';

const Videos = () => {
  const [eventos, setEventos] = useState([]);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [newEvent, setNewEvent] = useState({ nome_evento: '', data_evento: '' });
  const [newVideo, setNewVideo] = useState({ tipo: 'arquivo', caminho_video: '', thumbnail: null, videoFiles: [] });

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('eventos_videos')
      .select('*, videos(caminho_video, thumbnail, tipo)')
      .order('data_evento', { ascending: false });
    if (data) setEventos(data);
    setLoading(false);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('eventos_videos').insert([newEvent]).select();
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
      .from('videos')
      .select('*')
      .eq('id_evento', evento.id)
      .order('criado_em', { ascending: false });
    if (data) setVideos(data);
    setLoading(false);
  };

  const sanitizeFilename = (name) => {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9.]/g, '_') // Substitui caracteres especiais por _
      .toLowerCase();
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    const files = newVideo.videoFiles || [];
    const itemsToProcess = newVideo.tipo === 'link' ? [null] : Array.from(files);
    const itemsToInsert = [];

    for (const file of itemsToProcess) {
      let finalCaminho = newVideo.caminho_video;
      let finalThumbnail = null;

      try {
        if (newVideo.tipo === 'arquivo' && file) {
          // Adicionando um sufixo aleatório para garantir unicidade absoluta
          const randomSuffix = Math.random().toString(36).substring(2, 8);
          const fileName = `${Date.now()}_${randomSuffix}_${sanitizeFilename(file.name)}`;
          
          const { data, error: storageError } = await supabase.storage
            .from('videos')
            .upload(fileName, file);
          
          if (storageError) {
            console.error("Erro no Storage:", storageError);
            alert(`Erro ao subir arquivo ${file.name}: ${storageError.message}`);
            continue;
          }
          
          finalCaminho = fileName;
        }

        // Upload do Thumbnail (se houver)
        if (newVideo.thumbFile) {
          const randomSuffix = Math.random().toString(36).substring(2, 8);
          const thumbName = `thumb_${Date.now()}_${randomSuffix}_${sanitizeFilename(newVideo.thumbFile.name)}`;
          const { data: thumbData, error: thumbError } = await supabase.storage
            .from('videos')
            .upload(thumbName, newVideo.thumbFile);
          
          if (!thumbError) {
            finalThumbnail = thumbName;
          }
        }

        // Coleta o item para inserção em lote
        itemsToInsert.push({
          id_evento: selectedEvento.id,
          tipo: newVideo.tipo,
          caminho_video: finalCaminho,
          thumbnail: finalThumbnail
        });

      } catch (err) {
        console.error("Erro inesperado no loop:", err);
      }
    }

    // Inserção em lote (Bulk Insert)
    if (itemsToInsert.length > 0) {
      const { data: dbData, error: dbError } = await supabase
        .from('videos')
        .insert(itemsToInsert)
        .select();

      if (dbError) {
        console.error("Erro no Banco de Dados (Bulk Insert):", dbError);
        alert(`Erro ao salvar no banco: ${dbError.message}`);
      } else if (dbData) {
        setVideos(prev => [...dbData, ...prev]);
        
        // Atualiza capa se necessário (usando o primeiro item do lote que tenha thumbnail)
        const firstWithThumb = itemsToInsert.find(item => item.thumbnail);
        if (!selectedEvento.capa_video && firstWithThumb) {
          await supabase.from('eventos_videos').update({ capa_video: firstWithThumb.thumbnail }).eq('id', selectedEvento.id);
          setSelectedEvento({...selectedEvento, capa_video: firstWithThumb.thumbnail});
        }
      }
    }
    
    setIsAddingVideo(false);
    setNewVideo({ tipo: 'arquivo', caminho_video: '', thumbnail: null, videoFiles: [] });
    setUploading(false);
  };

  const handleDeleteVideo = async (video) => {
    if (window.confirm('Excluir este vídeo permanentemente?')) {
      if (video.tipo === 'arquivo') {
        await supabase.storage.from('videos').remove([video.caminho_video]);
      }
      if (video.thumbnail) {
        await supabase.storage.from('videos').remove([video.thumbnail]);
      }
      const { error } = await supabase.from('videos').delete().eq('id', video.id);
      if (!error) {
        setVideos(videos.filter(v => v.id !== video.id));
      }
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Excluir este álbum e todos os vídeos vinculados?')) {
      const { error } = await supabase.from('eventos_videos').delete().eq('id', id);
      if (!error) {
        setEventos(eventos.filter(e => e.id !== id));
        if (selectedEvento?.id === id) setSelectedEvento(null);
      }
    }
  };

  if (loading && eventos.length === 0) return <div>Carregando...</div>;

  return (
    <div className="admin-videos">
      {!selectedEvento ? (
        <>
          <div className="admin-page-header">
            <h2 className="section-title">Álbuns de Vídeos</h2>
            <button onClick={() => setIsAdding(true)} className="admin-btn">Novo Álbum</button>
          </div>

          {isAdding && (
            <div className="admin-card" style={{ marginBottom: '30px' }}>
              <h3>Criar Novo Álbum de Vídeos</h3>
              <form onSubmit={handleCreateEvent} className="admin-form-inline">
                <input 
                  type="text" 
                  placeholder="Nome (ex: Melhores Momentos)" 
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
                  {event.capa_video ? (
                    <img src={storageUrl('videos', event.capa_video)} alt={event.nome_evento} />
                  ) : (
                    // Fallback para o primeiro vídeo do álbum
                    event.videos?.[0] ? (
                      event.videos[0].thumbnail ? (
                        <img src={storageUrl('videos', event.videos[0].thumbnail)} alt={event.nome_evento} />
                      ) : event.videos[0].tipo === 'arquivo' ? (
                        <video 
                          src={`${storageUrl('videos', event.videos[0].caminho_video)}#t=0.1`} 
                          preload="metadata" 
                          muted 
                          playsInline
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="album-placeholder">🎬</div>
                      )
                    ) : (
                      <div className="album-placeholder">🎬</div>
                    )
                  )}
                  <span className="album-badge">
                    {event.videos?.length || 0} vídeos
                  </span>
                </div>
                <div className="album-info">
                  <h3>{event.nome_evento}</h3>
                  <span className="album-date">{new Date(event.data_evento).toLocaleDateString()}</span>
                </div>
                <div className="album-actions" onClick={e => e.stopPropagation()}>
                  <button className="admin-btn secondary small" onClick={() => handleOpenAlbum(event)}>
                    Gerenciar Vídeos
                  </button>
                  <button className="admin-btn-danger" onClick={() => handleDeleteEvent(event.id)} title="Excluir Álbum">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {eventos.length === 0 && !loading && (
              <div className="empty-state">
                Nenhum álbum de vídeo criado ainda. Clique em "Novo Álbum" para começar!
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
            <button onClick={() => setIsAddingVideo(true)} className="admin-btn">🚀 Lançar Vídeo</button>
          </div>

          {isAddingVideo && (
            <div className="admin-card">
              <h3>Novo Vídeo</h3>
              <form onSubmit={handleAddVideo} className="admin-form">
                <div className="form-group">
                  <label>Tipo de Vídeo</label>
                  <select 
                    value={newVideo.tipo} 
                    onChange={e => setNewVideo({...newVideo, tipo: e.target.value})}
                    className="admin-input"
                  >
                    <option value="arquivo">Arquivo (.mp4)</option>
                    <option value="link">Link (YouTube/Externo)</option>
                  </select>
                </div>

                {newVideo.tipo === 'link' ? (
                  <div className="form-group">
                    <label>URL do Vídeo</label>
                    <input 
                      type="url" 
                      placeholder="https://youtube.com/..." 
                      value={newVideo.caminho_video}
                      onChange={e => setNewVideo({...newVideo, caminho_video: e.target.value})}
                      required
                      className="admin-input"
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Arquivos MP4 (Selecione um ou mais)</label>
                    <input 
                      type="file" 
                      accept="video/mp4" 
                      multiple
                      onChange={e => setNewVideo({...newVideo, videoFiles: e.target.files})}
                      required
                      className="admin-input"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Thumbnail (Opcional - Capa do vídeo)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setNewVideo({...newVideo, thumbFile: e.target.files[0]})}
                    className="admin-input"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="admin-btn" disabled={uploading}>
                    {uploading ? '⌛ Subindo...' : 'Salvar Vídeo'}
                  </button>
                  <button type="button" onClick={() => setIsAddingVideo(false)} className="admin-btn secondary">Cancelar</button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Carregando vídeos...</p>
            </div>
          ) : (
            <div className="admin-videos-grid">
              {videos.map(video => (
                <div key={video.id} className="admin-video-card">
                  <div className="video-preview">
                    {video.thumbnail ? (
                      <img src={storageUrl('videos', video.thumbnail)} alt="Thumb" loading="lazy" />
                    ) : video.tipo === 'arquivo' ? (
                      <video 
                        src={`${storageUrl('videos', video.caminho_video)}#t=0.1`} 
                        preload="metadata" 
                        muted 
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="video-placeholder">▶</div>
                    )}
                    <span className="type-tag">{video.tipo}</span>
                  </div>
                  <div className="video-info-mini">
                    <p className="video-path-label" title={video.caminho_video}>
                      {video.caminho_video.length > 25 ? video.caminho_video.substring(0, 25) + '...' : video.caminho_video}
                    </p>
                    <button className="delete-btn-mini" onClick={() => handleDeleteVideo(video)}>Remover Vídeo</button>
                  </div>
                </div>
              ))}
              {videos.length === 0 && (
                <div className="empty-state">
                  Este álbum está vazio. Use o botão 🚀 para lançar vídeos!
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Videos;
