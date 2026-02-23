import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AddProblemModal from '../components/AddProblemModal';

export default function ModelDetailPage() {
  const { modelId } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [model, setModel]         = useState(null);
  const [company, setCompany]     = useState(null);
  const [problems, setProblems]   = useState([]);
  const [expanded, setExpanded]   = useState({});
  const [editProblem, setEditProblem] = useState(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [companies, setCompanies] = useState([]);
  const [models, setModels]       = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      const mSnap = await getDoc(doc(db, 'models', modelId));
      if (!mSnap.exists()) { navigate('/'); return; }
      const mData = { id: mSnap.id, ...mSnap.data() };
      setModel(mData);
      const cSnap = await getDoc(doc(db, 'companies', mData.companyId));
      if (cSnap.exists()) setCompany({ id: cSnap.id, ...cSnap.data() });
      setLoading(false);
    })();

    const unsub = onSnapshot(
      query(collection(db, 'problems'), where('modelId', '==', modelId), orderBy('createdAt', 'desc')),
      snap => setProblems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [modelId, navigate]);

  /* For the modal dropdowns when editing */
  useEffect(() => {
    getDoc(doc(db, 'companies', model?.companyId || '_')).catch(() => {});
    // Load all companies and models for the modal
    import('firebase/firestore').then(({ getDocs }) => {
      getDocs(collection(db, 'companies')).then(s => setCompanies(s.docs.map(d => ({ id: d.id, ...d.data() }))));
      getDocs(collection(db, 'models')).then(s => setModels(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    });
  }, [model]);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleDelete = async (pid) => {
    if (!window.confirm('Delete this problem/solution?')) return;
    await deleteDoc(doc(db, 'problems', pid));
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="spinner"><div className="spin"/></div>
    </>
  );

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ paddingTop: 28, paddingBottom: 40 }}>
        <button className="back-btn" onClick={() => navigate('/')}>← Back to Companies</button>

        <div className="model-header">
          <div className="model-header-info">
            <div className="model-breadcrumb">
              {company?.emoji} {company?.name} › Models
            </div>
            <h2>📲 {model?.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
              {problems.length} known issue{problems.length !== 1 ? 's' : ''}
            </p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              + Add Problem
            </button>
          )}
        </div>

        {problems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No problems logged yet</h3>
            <p>
              {isAdmin
                ? 'Click "Add Problem" to log the first issue for this model.'
                : 'No issues have been logged for this model.'}
            </p>
          </div>
        ) : (
          <div className="problems-list">
            {problems.map(p => (
              <div key={p.id} className="problem-card">
                <div className="problem-card-header" onClick={() => toggle(p.id)}>
                  <div style={{ flex: 1 }}>
                    <div className="problem-title">{p.problem}</div>
                    <div className="problem-meta">
                      Added {p.createdAt?.toDate?.().toLocaleDateString() ?? '—'}
                      {p.updatedAt && ' · Edited ' + p.updatedAt.toDate().toLocaleDateString()}
                    </div>
                  </div>
                  <div className="problem-actions" onClick={(e) => e.stopPropagation()}>
                    {isAdmin && (
                      <>
                        <button className="btn btn-sm btn-secondary" onClick={() => setEditProblem(p)}>✏ Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>✕</button>
                      </>
                    )}
                    <span style={{ color: 'var(--text-muted)', marginLeft: 4, cursor: 'pointer' }}
                          onClick={() => toggle(p.id)}>
                      {expanded[p.id] ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
                {expanded[p.id] && (
                  <div className="problem-body">
                    <div className="solution-label">✅ Solution</div>
                    <div className="solution-text">{p.solution || 'No solution provided yet.'}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {(showAdd || editProblem) && (
        <AddProblemModal
          companies={companies}
          models={models}
          defaultModelId={modelId}
          editData={editProblem}
          onClose={() => { setShowAdd(false); setEditProblem(null); }}
        />
      )}
    </div>
  );
}
