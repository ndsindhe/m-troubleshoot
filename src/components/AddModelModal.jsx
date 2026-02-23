import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from './Modal';

export default function AddModelModal({ companies, editData, onClose }) {
  const isEdit = !!editData;
  const [name, setName]           = useState('');
  const [companyId, setCompanyId] = useState('');
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    if (editData) { setName(editData.name); setCompanyId(editData.companyId || ''); }
  }, [editData]);

  const handleSave = async () => {
    if (!companyId) { setError('Please select a company.'); return; }
    if (!name.trim()) { setError('Model name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const company = companies.find(c => c.id === companyId);
      if (isEdit) {
        await updateDoc(doc(db, 'models', editData.id), {
          name: name.trim(), companyId, companyName: company?.name || '', updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'models'), {
          name: name.trim(), companyId, companyName: company?.name || '', createdAt: serverTimestamp(),
        });
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
      title={isEdit ? '✏ Edit Model' : '+ Add Model'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Model'}
          </button>
        </>
      }
    >
      <div className="form-group">
        <label>Company *</label>
        <select className="form-control" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
          <option value="">— Select Company —</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Model Name *</label>
        <input
          className="form-control"
          placeholder="e.g. iPhone 15 Pro, Galaxy S24 Ultra…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>
      {error && <p className="form-error" style={{ textAlign: 'left' }}>{error}</p>}
    </Modal>
  );
}
