import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-logo">
          <div className="logo-circle">PF</div>
          <span className="logo-text">PONTA FIRME</span>
        </div>
        <div className="footer-links">
          <a href="#">Sobre o Clube</a>
          <a href="#">Contato</a>
          <a href="#">Termos de Uso</a>
        </div>
        <div className="footer-social">
          <a href="#" className="social-icon">IG</a>
          <a href="#" className="social-icon">FB</a>
          <a href="#" className="social-icon">YT</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 Ponta Firme Futebol Clube. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
