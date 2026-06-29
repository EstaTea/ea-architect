import React, { useState, useEffect } from 'react';
import useStore from '../store.js';

const genId = (prefix) => `${prefix}-${Date.now().toString(36)}`;

const CAPABILITY_CATEGORIES = ['core', 'supporting', 'strategic'];
const APP_TYPES = ['application', 'technology'];
const NODE_TYPES = ['capability', 'application', 'technology'];
const STATUSES = ['active', 'planned', 'retiring', 'sunset'];

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 8, width: 480, maxHeight: '90vh',
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
  label: { fontSize: 12, fontWeight: 600, color: '#595959', marginBottom: 4, display: 'block' },
  input: {
    width: '100%', padding: '7px 10px', border: '1px solid #d9d9d9',
    borderRadius: 4, fontSize: 13, outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '7px 10px', border: '1px solid #d9d9d9',
    borderRadius: 4, fontSize: 13, background: '#fff', cursor: 'pointer',
    boxSizing: 'border-box',
  },
  footer: {
    padding: '12px 20px', borderTop: '1px solid #f0f0f0',
    display: 'flex', justifyContent: 'flex-end', gap: 8,
  },
  cancelBtn: {
    padding: '6px 18px', borderRadius: 4, border: '1px solid #d9d9d9',
    background: '#fff', cursor: 'pointer', fontSize: 13,
  },
  saveBtn: {
    padding: '6px 18px', borderRadius: 4, border: '1px solid #1890ff',
    background: '#1890ff', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
  },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  divider: { height: 1, background: '#f0f0f0', margin: '10px 0' },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 },
};

export default function NodeForm() {
  const modalState = useStore(s => s.modalState);
  const closeModal = useStore(s => s.closeModal);
  const upsertNode = useStore(s => s.upsertNode);
  const nodes = useStore(s => s.nodes);

  const isOpen = modalState?.type === 'node';
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

  const handleSave = () => {
    const node = fromForm(form, isEdit ? existing.id : genId(form.type === 'capability' ? 'cap' : form.type === 'application' ? 'app' : 'tech'), nodes);
    upsertNode(node);
    closeModal();
  };

  // 能力节点的父节点选项
  const parentOptions = nodes.filter(n =>
    n.type === 'capability' && n.level < 3 && n.id !== existing?.id
  );

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.title}>{isEdit ? 'Edit' : 'Add'} Node</span>
          <button style={styles.closeBtn} onClick={closeModal}>✕</button>
        </div>
        <div style={styles.body}>
          {/* Basic */}
          <div style={styles.row}>
            <label style={styles.label}>Name *</label>
            <input style={styles.input} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Node name" />
          </div>
          <div style={styles.row2}>
            <div>
              <label style={styles.label}>Type *</label>
              <select style={styles.select} value={form.type} onChange={e => set('type', e.target.value)} disabled={isEdit}>
                {NODE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Category</label>
              <select style={styles.select} value={form.category} onChange={e => set('category', e.target.value)}>
                {CAPABILITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Capability-specific */}
          {form.type === 'capability' && (
            <>
              <div style={styles.row}>
                <label style={styles.label}>Parent Capability (optional)</label>
                <select style={styles.select} value={form.parent} onChange={e => set('parent', e.target.value)}>
                  <option value="">— Root (L0) —</option>
                  {parentOptions.map(n => (
                    <option key={n.id} value={n.id}>
                      {'  '.repeat(n.level)}L{n.level} {n.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Application/Technology */}
          {(form.type === 'application' || form.type === 'technology') && (
            <div style={styles.row2}>
              <div>
                <label style={styles.label}>Vendor</label>
                <input style={styles.input} value={form.meta.vendor} onChange={e => setMeta('vendor', e.target.value)} placeholder="e.g. SAP" />
              </div>
              <div>
                <label style={styles.label}>Version</label>
                <input style={styles.input} value={form.meta.version} onChange={e => setMeta('version', e.target.value)} placeholder="e.g. 2023" />
              </div>
            </div>
          )}

          <div style={styles.divider} />
          <div style={styles.sectionLabel}>Metadata</div>

          <div style={styles.row2}>
            <div>
              <label style={styles.label}>Status</label>
              <select style={styles.select} value={form.meta.status} onChange={e => setMeta('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Maturity (1–5)</label>
              <select style={styles.select} value={form.meta.maturity} onChange={e => setMeta('maturity', Number(e.target.value))}>
                {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Owner</label>
            <input style={styles.input} value={form.meta.owner} onChange={e => setMeta('owner', e.target.value)} placeholder="Team or person name" />
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Description</label>
            <textarea
              style={{ ...styles.input, resize: 'vertical', minHeight: 60 }}
              value={form.meta.description}
              onChange={e => setMeta('description', e.target.value)}
              placeholder="Brief description..."
            />
          </div>
          <div style={styles.row}>
            <label style={styles.label}>Tags (comma-separated)</label>
            <input style={styles.input} value={form.meta.tagsStr} onChange={e => setMeta('tagsStr', e.target.value)} placeholder="e.g. SAP, ERP, Core" />
          </div>
        </div>
        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
          <button style={styles.saveBtn} onClick={handleSave} disabled={!form.name.trim()}>
            {isEdit ? 'Save Changes' : 'Add Node'}
          </button>
        </div>
      </div>
    </div>
  );
}

function getDefault() {
  return {
    name: '', type: 'capability', category: 'core', parent: '',
    meta: { status: 'active', maturity: 3, owner: '', description: '', vendor: '', version: '', tagsStr: '' },
  };
}

function toForm(node) {
  const m = node.metadata || {};
  return {
    name: node.name, type: node.type, category: node.category || 'core',
    parent: node.parent || '',
    meta: { status: m.status || 'active', maturity: m.maturity || 3, owner: m.owner || '',
      description: m.description || '', vendor: m.vendor || '', version: m.version || '',
      tagsStr: (m.tags || []).join(', ') },
  };
}

function fromForm(form, id, nodes) {
  const tags = form.meta.tagsStr.split(',').map(s => s.trim()).filter(Boolean);
  let level = null;
  if (form.type === 'capability') {
    if (!form.parent) {
      level = 0;
    } else {
      const parentNode = nodes?.find(n => n.id === form.parent);
      level = parentNode ? (parentNode.level ?? 0) + 1 : 1;
    }
  }
  return {
    id, name: form.name.trim(), type: form.type, category: form.category,
    parent: form.parent || null, level,
    metadata: {
      status: form.meta.status, maturity: Number(form.meta.maturity),
      owner: form.meta.owner, description: form.meta.description,
      vendor: form.meta.vendor, version: form.meta.version, tags,
    }
  };
}
