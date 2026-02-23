import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AddProblemModal from '../components/AddProblemModal';

export default function HomePage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies]         = useState([]);
  const [models, setModels]               = useState([]);
  const [problemCounts, setProblemCounts] = useState({});
  const [expanded, setExpanded]           = useState({});
  const [showAddProblem, setShowAddProblem] = useState(false);
  const [loading, setLoading]             = useState(true);

  /* ── real-time listeners ── */
  useEffect(() => {
    const unsub1 = onSnapshot(query(collection(db, 'companies'), orderBy('name')), snap => {
      setCompanies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    const unsub2 = onSnapshot(query(collection(db, 'models'), orderBy('name')), snap => {
      setModels(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  /* ── count problems per model ── */
  useEffect(() => {
    if (!models.length) return;
    (async () => {
      const counts = {};
      for (const m of models) {
        const snap = await getDocs(query(collection(db, 'problems'), where('modelId', '==', m.id)));
        counts[m.id] = snap.size;
      }
      setProblemCounts(counts);
    })();
  }, [models]);

  const modelsFor = (companyId) => models.filter(m => m.companyId === companyId);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) return (
    <>
      <Navbar />
      <div className="spinner"><div className="spin"/></div>
    </>
  );

  return (
    <div className="page">
      <Navbar />
      <div className="container home-content">
        <div className="page-header">
          <div>
            <h2>Companies</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 2 }}>
              Select a company to browse models and issues
            </p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowAddProblem(true)}>
              + Add Problem / Solution
            </button>
          )}
        </div>

        {companies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <h3>No companies yet</h3>
            <p>Go to Manage to add companies and models.</p>
          </div>
        ) : (
          <div className="company-grid">
            {companies.map(company => {
              const mList = modelsFor(company.id);
              const isOpen = expanded[company.id];
              return (
                <div key={company.id} className={`company-card ${isOpen ? 'expanded' : ''}`}>
                  <div className="company-card-header" onClick={() => toggle(company.id)}>
                    <div className="company-info">
                      <span className="company-emoji">{company.emoji || '📱'}</span>
                      <div>
                        <div className="company-name">{company.name}</div>
                        <div className="company-count">{mList.length} model{mList.length !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    <span className={`chevron ${isOpen ? 'open' : ''}`}>▼</span>
                  </div>
                  {isOpen && (
                    <div className="model-list">
                      {mList.length === 0 ? (
                        <div style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          No models added yet.
                        </div>
                      ) : mList.map(m => (
                        <div key={m.id} className="model-item" onClick={() => navigate(`/model/${m.id}`)}>
                          <span className="model-icon">📲</span>
                          <span className="model-item-name">{m.name}</span>
                          <span className="model-item-count">
                            {problemCounts[m.id] ?? 0} issue{problemCounts[m.id] !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddProblem && (
        <AddProblemModal
          companies={companies}
          models={models}
          onClose={() => setShowAddProblem(false)}
        />
      )}
    </div>
  );
}
