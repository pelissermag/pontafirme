import React, { useState, useEffect } from 'react';
import { supabase, storageUrl } from '../../lib/supabase';
import defaultLogo from '../../assets/logo.png';

const About = () => {
  const [settings, setSettings] = useState({
    hero_title: '',
    hero_tagline: '',
    sobre_texto: '',
    club_logo: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase.from('settings').select('*');
    if (data) {
      const newSettings = { ...settings };
      data.forEach(item => {
        newSettings[item.key] = item.value;
      });
      setSettings(newSettings);
      
      if (newSettings.club_logo) {
        setLogoPreview(storageUrl('config', newSettings.club_logo));
      } else {
        setLogoPreview(defaultLogo);
      }
    }
    setLoading(false);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const sanitizeFilename = (name) => {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9.]/g, '_') // Substitui caracteres especiais por _
      .toLowerCase();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    let currentLogoName = settings.club_logo;

    // Upload do Logo se houver novo arquivo
    if (logoFile) {
      const fileName = `logo_${Date.now()}_${sanitizeFilename(logoFile.name)}`;
      const { data, error: uploadError } = await supabase.storage
        .from('config')
        .upload(fileName, logoFile);
      
      if (!uploadError) {
        currentLogoName = fileName;
      } else {
        console.error("Erro ao subir logo:", uploadError);
        alert(`Erro ao subir logo: ${uploadError.message}`);
        setSaving(false);
        return;
      }
    }

    const finalSettings = { ...settings, club_logo: currentLogoName };
    const updates = Object.entries(finalSettings).map(([key, value]) => ({
      key, value
    }));

    const { error } = await supabase.from('settings').upsert(updates, { onConflict: 'key' });

    if (error) {
      alert('Erro ao salvar configurações.');
    } else {
      setSettings(finalSettings);
      alert('Configurações e Logo salvos com sucesso!');
    }
    setSaving(false);
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="admin-about">
      <div className="admin-page-header">
        <h2 className="section-title">Identidade do Clube (Ponta Firme)</h2>
      </div>
      
      <div className="admin-grid-two-cols">
        <form onSubmit={handleSave} className="admin-card">
          <div className="form-group-admin">
            <label>Título Principal (Hero)</label>
            <input 
              type="text" 
              value={settings.hero_title} 
              onChange={(e) => setSettings({...settings, hero_title: e.target.value})}
              className="admin-input"
              placeholder="Ex: PONTA FIRME FC"
            />
          </div>

          <div className="form-group-admin">
            <label>Tagline (Subtítulo)</label>
            <input 
              type="text" 
              value={settings.hero_tagline} 
              onChange={(e) => setSettings({...settings, hero_tagline: e.target.value})}
              className="admin-input"
              placeholder="Ex: FORÇA, TRADIÇÃO E RAÇA"
            />
          </div>

          <div className="form-group-admin">
            <label>História do Clube (Sobre)</label>
            <textarea 
              rows="12"
              value={settings.sobre_texto} 
              onChange={(e) => setSettings({...settings, sobre_texto: e.target.value})}
              className="admin-input"
              placeholder="Conte a história do Ponta Firme aqui..."
            ></textarea>
            <small style={{ color: '#888' }}>As quebras de linha serão preservadas no site.</small>
          </div>

          <button type="submit" className="admin-btn" disabled={saving}>
            {saving ? '⌛ Salvando...' : '💾 Atualizar Site'}
          </button>
        </form>

        <div className="admin-card logo-preview-card">
          <h3>Logo do Clube</h3>
          <div className="logo-display-container">
            <img src={logoPreview} alt="Club Logo" className="admin-logo-preview" />
          </div>
          
          <div className="form-group-admin">
            <label className="admin-btn secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>
              📁 Escolher Novo Logo
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleLogoChange} 
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <p className="admin-help-text">
            Recomendado: Imagem PNG com fundo transparente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
