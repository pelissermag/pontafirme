import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const Sponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSponsor, setNewSponsor] = useState({ nome: '', link_url: '', logo_url: '' });

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    const { data, error } = await supabase.from('patrocinadores').select('*').order('ordem', { ascending: true });
    if (data) setSponsors(data);
    setLoading(false);
  };

  const handleCreateSponsor = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('patrocinadores').insert([newSponsor]).select();
    if (data) {
      setSponsors([...sponsors, data[0]]);
      setIsAdding(false);
      setNewSponsor({ nome: '', link_url: '', logo_url: '' });
    }
  };

  const handleDeleteSponsor = async (id) => {
    if (window.confirm('Excluir patrocinador?')) {
      const { error } = await supabase.from('patrocinadores').delete().eq('id', id);
      if (!error) {
        setSponsors(sponsors.filter(s => s.id !== id));
      }
    }
  };

  return (
    <div className="admin-sponsors">
      <div className="admin-page-header">
        <h2 className="section-title">Gerenciar Patrocinadores</h2>
        <button onClick={() => setIsAdding(true)} className="admin-btn">Novo Patrocinador</button>
      </div>

      {isAdding && (
        <div className="admin-card">
          <h3>Novo Patrocinador</h3>
          <form onSubmit={handleCreateSponsor} className="admin-form-inline">
            <input 
              type="text" 
              placeholder="Nome" 
              value={newSponsor.nome}
              onChange={e => setNewSponsor({...newSponsor, nome: e.target.value})}
              required
              className="admin-input"
            />
            <input 
              type="text" 
              placeholder="Link (URL)" 
              value={newSponsor.link_url}
              onChange={e => setNewSponsor({...newSponsor, link_url: e.target.value})}
              className="admin-input"
            />
            <button type="submit" className="admin-btn">Adicionar</button>
            <button type="button" onClick={() => setIsAdding(false)} className="admin-btn secondary">Cancelar</button>
          </form>
        </div>
      )}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Link</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sponsors.map(sponsor => (
              <tr key={sponsor.id}>
                <td>{sponsor.nome}</td>
                <td>{sponsor.link_url}</td>
                <td>{sponsor.status ? 'Ativo' : 'Inativo'}</td>
                <td>
                  <button className="admin-btn-icon" onClick={() => handleDeleteSponsor(sponsor.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sponsors;
