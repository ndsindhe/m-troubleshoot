import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

export default function AddProblemModal({ companies, models, defaultModelId, editData, onClose }) {
  const { user } = useAuth();
  const isEdit = !!editData;

  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedModel, setSelectedModel]     = useState(defaultModelId || '');
  const [problem, setProblem]                 = useState('');
  const [solution, setSolution]               = useState('');
  const [error, setError]                     = useState('');
  const [saving, setSaving]                   = useState(false);

  useEffect(() => {
    if (editData) {
      setSelectedCompany(editData.companyId || '');
      setSelectedModel(editData.modelId || '');
      setProblem(editData.problem || '');
      setSolution(editData.solution || '');
    } else if (defaultModelId) {
      const m = models.find(m => m.id === defaultModelId);
      if (m) setSelectedCompany(m.companyId);
    }
  }, [editData, defaultModelId, models]);

  const filteredModels = models.filter(m => !selectedCompany || m.companyId === selectedCompany);

  const handleSave = async () => {
    if (!selectedModel) { setError('Please select a model.'); return; }
    if (!problem.trim()) { setError('Please enter a problem description.'); return; }
    setSaving(true);
    setError('');
    try {
      const model   = models.find(m => m.id === selectedModel);
      const company = companies.find(c => c.id === (model?.companyId || selectedCompany));
      const payload = {
        problem: problem.trim(),
        solution: solution.trim(),
        modelId:     model?.id || selectedModel,
        modelName:   model?.name || '',
        companyId:   company?.id || '',
        companyName: company?.name || '',
        updatedAt:   serverTimestamp(),
      };
      if (isEdit) {
        await updateDoc(doc(db, 'problems', editData.id), payload);
      } else {
        await addDoc(collection(db, 'problems'), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: user?.uid,
        });
      }
      onClose();
    } catch (e) {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? '✏ Edit Problem / Solution' : '+ Add Problem / Solution'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Entry'}
          </button>
        </>
      }
    >
      <div className="form-group">
        <label>Company</label>
        <select
          className="form-control"
          value={selectedCompany}
          onChange={(e) => { setSelectedCompany(e.target.value); setSelectedModel(''); }}
        >
          <option value="">— Select Company —</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Model *</label>
        <select
          className="form-control"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="">— Select Model —</option>
          {filteredModels.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Problem *</label>
        <textarea
          className="form-control"
          placeholder="Describe the problem or issue with the device…"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Solution</label>
        <textarea
          className="form-control"
          placeholder="Describe the solution or fix…"
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          rows={5}
        />
      </div>

      {error && <p className="form-error" style={{ textAlign: 'left' }}>{error}</p>}
    </Modal>
  );
}
