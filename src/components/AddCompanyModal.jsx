import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from './Modal';

const EMOJI_OPTIONS = ['📱','🍎','🤖','📷','🎮','💻','⭐','🔥','💎','🌟','🔵','🟠','🟣','🔶','🏅'];

export default function AddCompanyModal({ editData, onClose }) {
  const isEdit = !!editData;
  const [name, setName]   = useState('');
  const [emoji, setEmoji] = useState('📱');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) { setName(editData.name); setEmoji(editData.emoji || '📱'); }
  }, [editData]);

  const handleSave = async () => {
    if (!name.trim()) { setError('Company name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await updateDoc(doc(db, 'companies', editData.id), { name: name.trim(), emoji, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'companies'), { name: name.trim(), emoji, createdAt: serverTimestamp() });
      }
      onClose();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? '✏ Edit Company' : '+ Add Company'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Company'}
          </button>
        </>
      }
    >
      <div className="form-group">
        <label>Icon</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {EMOJI_OPTIONS.map(e => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              style={{
                fontSize: '1.4rem', padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                border: `2px solid ${emoji === e ? 'var(--accent)' : 'var(--border)'}`,
                background: emoji === e ? 'var(--accent-dim)' : 'var(--surface2)',
              }}
            >{e}</button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>Company Name *</label>
        <input
          className="form-control"
          placeholder="e.g. Apple, Samsung, OnePlus…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>
      {error && <p className="form-error" style={{ textAlign: 'left' }}>{error}</p>}
    </Modal>
  );
}
