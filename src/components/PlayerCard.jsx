import React from 'react';
import './PlayerCard.css';

const PlayerCard = ({ player, isMobile, onClick }) => {
  return (
    <div className={`player-card ${isMobile ? 'mobile' : 'desktop'}`} onClick={() => onClick(player)}>
      <div className="player-image-container">
        <div className="player-placeholder">
          <span className="player-number">{player.number}</span>
        </div>
      </div>
      <div className="player-info">
        <h3 className="player-name">{player.name}</h3>
        <p className="player-position">{player.position}</p>
      </div>
      {!isMobile && (
        <div className="player-overlay">
          <span>VER ESTATÍSTICAS</span>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
