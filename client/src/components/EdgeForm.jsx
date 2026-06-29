import React, { useState, useEffect } from 'react';
import useStore from '../store.js';

const genId = (prefix) => `${prefix}-${Date.now().toString(36)}`;

const PROTOCOLS = ['REST', 'SOAP', 'MQ', 'DB', 'FILE', 'EDI', 'CUSTOM'];
const FREQUENCIES = ['real-time', 'batch', 'event'];
const CRITICALITIES = ['high', 'medium', 'low'];

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 8, width: 460, maxHeight: '90vh',
    display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  header: {
    padding: '16px 20px', borderBottom: '1px solid #f0f0f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  title: { fontSize: 15, fontWeight: 700, color: '#262626' },
  closeBtn: { cursor: 'pointer', border: 'none', background: 'none', fontSize: 18, color: '#8c8c8c' },
  body: { flex: 1, overflowY: 'auto', padding: '16px 20px' },
  row: { marginBottom: 14 },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 },
  label: { fontSize: 12, fontWeight: 600, color: '#595959', marginBottom: 4, display: 'block' },
  input: { width: '100%', padding: '7px 10px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', padding: '7px 10px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, background: '#fff', boxSizing: 'border-box' },
  footer: { padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 8 },
  cancelBtn: { padding: '6px 18px', borderRadius: 4, border: '1px solid #d9d9d9', background: '#fff', cursor: 'pointer', fontSize: 13 },
  saveBtn: { padding: '6px 18px', borderRadius: 4, border: '1px solid #1890ff', background: '#1890ff', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  divider: { height: 1, background: '#f0f0f0', margin: '10px 0' },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 },
  radioGroup: { display: 'flex', gap: 16 },
  radioLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' },
};

export default function EdgeForm() {
  const modalState = useStore(s => s.modalState);
  const closeModal = useStore(s => s.closeModal);
  const upsertEdge = useStore(s => s.upsertEdge);
  const nodes = useStore(s => s.nodes);

  const isOpen = modalState?.type === 'edge';
  const isEdit = modalState?.mode === 'edit';
  const existing = modalState?.data;

  const [form, setForm] = useState(getDefault());

  useEffect(() => {
    if (isOpen) {
      setForm(isEdit && existing ? toForm(existing) : getDefault());
    }
  }, [isOpen, isEdit, existing]);

  if (!isOpen) return null;

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setMeta = (key, val) => setForm(f => ({ ...f, meta: { ...f.meta, [key]: val } }));

  // 仅 application 和 technology 节点可作为集成端点
  const appNodes = nodes.filter(n => n.type === 'application' || n.type === 'technology');

  const handleSave = () => {
    const edge = {
      id: isEdit ? existing.id : genId('int'),
      source: form.source,
      target: form.target,
      type: 'integration',
      protocol: form.protocol,
      direction: form.direction,
      metadata: {
        description: form.meta.description,
        frequency: form.meta.frequency,
        criticality: form.meta.criticality,
        dataEntities: form.meta.dataEntitiesStr.split(',').map(s => s.trim()).filter(Boolean),
      }
    };
    upsertEdge(edge);
    closeModal();
  };

  const isValid = form.source && form.target && form.source !== form.target;

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.title}>{isEdit ? 'Edit' : 'Add'} Integration</span>
          <button style={styles.closeBtn} onClick={closeModal}>✕</button>
        </div>
        <div style={styles.body}>
          <div style={styles.row2}>
            <div>
              <label style={styles.label}>Source *</label>
              <select style={styles.select} value={form.source} onChange={e => set('source', e.target.value)} disabled={isEdit}>
                <option value="">— Select —</option>
                {appNodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Target *</label>
              <select style={styles.select} value={form.target} onChange={e => set('target', e.target.value)} disabled={isEdit}>
                <option value="">— Select —</option>
                {appNodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.row2}>
            <div>
              <label style={styles.label}>Protocol *</label>
              <select style={styles.select} value={form.protocol} onChange={e => set('protocol', e.target.value)}>
                {PROTOCOLS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Direction</label>
              <div style={{ ...styles.radioGroup, marginTop: 8 }}>
                {['uni', 'bi'].map(d => (
                  <label key={d} style={styles.radioLabel}>
                    <input type="radio" value={d} checked={form.direction === d} onChange={() => set('direction', d)} />
                    {d === 'uni' ? '→ Uni' : '↔ Bi'}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.divider} />
          <div style={styles.sectionLabel}>Details</div>

          <div style={styles.row2}>
            <div>
              <label style={styles.label}>Frequency</label>
              <select style={styles.select} value={form.meta.frequency} onChange={e => setMeta('frequency', e.target.value)}>
                {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Criticality</label>
              <select style={styles.select} value={form.meta.criticality} onChange={e => setMeta('criticality', e.target.value)}>
                {CRITICALITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Description</label>
            <input style={styles.input} value={form.meta.description} onChange={e => setMeta('description', e.target.value)} placeholder="What data flows between these systems?" />
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Data Entities (comma-separated)</label>
            <input style={styles.input} value={form.meta.dataEntitiesStr} onChange={e => setMeta('dataEntitiesStr', e.target.value)} placeholder="e.g. Employee, OrgUnit, Invoice" />
          </div>
        </div>
        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          <button style={styles.saveBtn} onClick={handleSave} disabled={!isValid}>
            {isEdit ? 'Save Changes' : 'Add Integration'}
          </button>
        </div>
      </div>
    </div>
  );
}

function getDefault() {
  return {
    source: '', target: '', protocol: 'REST', direction: 'uni',
    meta: { description: '', frequency: 'real-time', criticality: 'medium', dataEntitiesStr: '' },
  };
}

function toForm(edge) {
  const m = edge.metadata || {};
  return {
    source: edge.source, target: edge.target,
    protocol: edge.protocol || 'REST', direction: edge.direction || 'uni',
    meta: { description: m.description || '', frequency: m.frequency || 'real-time',
      criticality: m.criticality || 'medium', dataEntitiesStr: (m.dataEntities || []).join(', ') },
  };
}
