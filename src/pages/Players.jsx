import React, { useState, useEffect } from 'react';
import { getJogadores } from '../lib/queries';
import { storageUrl } from '../lib/supabase';
import './Players.css';

const Players = ({ isMobile }) => {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data, error } = await getJogadores();
    if (data) setJogadores(data);
    setLoading(false);
  };

  // Trava o scroll da página quando o modal está aberto
  useEffect(() => {
    if (selectedPlayer) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    }
    return () => { 
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    };
  }, [selectedPlayer]);

  if (loading) return <div className="loading">Carregando elenco...</div>;

  return (
    <div className="players-page reveal">
      <header className="page-header container">
        <h1 className="page-title">ELENCO</h1>
        <p className="page-subtitle">MEMBROS DO GRUPO</p>
      </header>

      <div className="players-grid container">
        {jogadores.map(player => (
          <div 
            key={player.id} 
            className="player-card"
            onClick={() => setSelectedPlayer(player)}
          >
            <div className="player-photo">
              {player.foto ? (
                <img src={storageUrl('jogadores', player.foto)} alt={player.nome} />
              ) : (
                <div className="photo-placeholder">PF</div>
              )}
            </div>
            <div className="player-info">
              <h3 className="player-name">{player.nome}</h3>
              <p className="player-meta">{player.idade} anos • Desde {player.ano_entrada}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedPlayer && (
        <div className={`modal-overlay ${selectedPlayer ? 'show' : ''}`} onClick={() => setSelectedPlayer(null)}>
          <div className={`modal-content ${isMobile ? 'bottom-sheet' : ''}`} onClick={e => e.stopPropagation()}>
            {isMobile && <div className="sheet-handle"></div>}
            <button className="close-btn" onClick={() => setSelectedPlayer(null)}>&times;</button>
            
            <div className="modal-body">
              <div className="modal-header">
                <h2 className="modal-name">{selectedPlayer.nome}</h2>
                <p className="modal-position">Atleta Ponta Firme</p>
              </div>
              
              <div className="player-history">
                <h3>História</h3>
                <p>{selectedPlayer.historia || 'Nenhuma história cadastrada para este jogador.'}</p>
              </div>

              <div className="player-stats-summary">
                 <div className="stat-item">
                    <span className="stat-label">Idade</span>
                    <span className="stat-value">{selectedPlayer.idade} anos</span>
                 </div>
                 <div className="stat-item">
                    <span className="stat-label">No grupo desde</span>
                    <span className="stat-value">{selectedPlayer.ano_entrada}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;
