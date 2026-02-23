import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import AddCompanyModal from '../components/AddCompanyModal';
import AddModelModal from '../components/AddModelModal';

const COMPANY_EMOJIS = ['📱','🍎','🤖','📷','🎮','💻','⭐','🔥','💎','🌟'];

export default function ManagePage() {
  const [tab, setTab]             = useState('companies');
  const [companies, setCompanies] = useState([]);
  const [models, setModels]       = useState([]);
  const [editCompany, setEditCompany] = useState(null);
  const [editModel, setEditModel]     = useState(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAddModel, setShowAddModel]     = useState(false);

  useEffect(() => {
    const u1 = onSnapshot(query(collection(db, 'companies'), orderBy('name')), snap =>
      setCompanies(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(query(collection(db, 'models'), orderBy('name')), snap =>
      setModels(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); };
  }, []);

  const deleteCompany = async (id) => {
    if (!window.confirm('Delete this company? Models under it will remain.')) return;
    await deleteDoc(doc(db, 'companies', id));
  };

  const deleteModel = async (id) => {
    if (!window.confirm('Delete this model? Problems under it will remain.')) return;
    await deleteDoc(doc(db, 'models', id));
  };

  return (
    <div className="page">
      <Navbar />
      <div className="container manage-content">
        <div className="page-header" style={{ marginBottom: 20 }}>
          <div>
            <h2>⚙ Manage</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 2 }}>
              Add and edit companies and models
            </p>
          </div>
          {tab === 'companies'
            ? <button className="btn btn-primary" onClick={() => setShowAddCompany(true)}>+ Add Company</button>
            : <button className="btn btn-primary" onClick={() => setShowAddModel(true)}>+ Add Model</button>
          }
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'companies' ? 'active' : ''}`} onClick={() => setTab('companies')}>
            🏢 Companies ({companies.length})
          </button>
          <button className={`tab ${tab === 'models' ? 'active' : ''}`} onClick={() => setTab('models')}>
            📲 Models ({models.length})
          </button>
        </div>

        {tab === 'companies' && (
          <div className="table-card">
            <table className="manage-table">
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Company Name</th>
                  <th>Models</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No companies yet</td></tr>
                )}
                {companies.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontSize: '1.4rem' }}>{c.emoji || '📱'}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{models.filter(m => m.companyId === c.id).length}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setEditCompany(c)}>✏ Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteCompany(c.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'models' && (
          <div className="table-card">
            <table className="manage-table">
              <thead>
                <tr>
                  <th>Model Name</th>
                  <th>Company</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No models yet</td></tr>
                )}
                {models.map(m => {
                  const c = companies.find(c => c.id === m.companyId);
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>📲 {m.name}</td>
                      <td>{c?.emoji} {c?.name ?? '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-sm btn-secondary" onClick={() => setEditModel(m)}>✏ Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteModel(m.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(showAddCompany || editCompany) && (
        <AddCompanyModal
          editData={editCompany}
          emojiOptions={COMPANY_EMOJIS}
          onClose={() => { setShowAddCompany(false); setEditCompany(null); }}
        />
      )}
      {(showAddModel || editModel) && (
        <AddModelModal
          companies={companies}
          editData={editModel}
          onClose={() => { setShowAddModel(false); setEditModel(null); }}
        />
      )}
    </div>
  );
}
