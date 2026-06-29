import React from 'react';
import useStore from '../store.js';
import { MATURITY_COLORS, STATUS_BADGE, PROTOCOL_COLORS } from '../cytoscapeStyles.js';

const styles = {
  panel: {
    width: 300,
    height: '100%',
    background: '#fff',
    borderLeft: '1px solid #e8e8e8',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '14px 16px',
    borderBottom: '1px solid #f0f0f0',
    background: '#fafafa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 13, fontWeight: 700, color: '#262626' },
  closeBtn: {
    cursor: 'pointer', border: 'none', background: 'none',
    fontSize: 16, color: '#8c8c8c', lineHeight: 1, padding: '2px 4px',
  },
  body: { flex: 1, overflowY: 'auto', padding: '12px 16px' },
  row: { marginBottom: 12 },
  label: { fontSize: 11, color: '#8c8c8c', marginBottom: 3, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' },
  value: { fontSize: 13, color: '#262626', wordBreak: 'break-word' },
  badge: (bg, border, color) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: 4,
    fontSize: 11, fontWeight: 600,
    background: bg, border: `1px solid ${border}`, color,
  }),
  maturityRow: { display: 'flex', alignItems: 'center', gap: 8 },
  maturityDot: (color) => ({
    width: 12, height: 12, borderRadius: 2,
    background: color, flexShrink: 0,
  }),
  footer: {
    padding: '12px 16px',
    borderTop: '1px solid #f0f0f0',
    display: 'flex', gap: 8,
  },
  btn: (variant) => ({
    flex: 1, padding: '6px 0', borderRadius: 4,
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    border: variant === 'danger' ? '1px solid #ff4d4f' : '1px solid #1890ff',
    background: variant === 'danger' ? '#fff1f0' : '#e6f7ff',
    color: variant === 'danger' ? '#cf1322' : '#0050b3',
  }),
  divider: { height: 1, background: '#f0f0f0', margin: '8px 0' },
  tagList: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 3 },
  tag: {
    fontSize: 11, padding: '2px 7px', borderRadius: 12,
    background: '#f0f0f0', color: '#595959', border: '1px solid #e0e0e0',
  },
};

const MATURITY_LABELS = { 1: 'Initial', 2: 'Managed', 3: 'Defined', 4: 'Quantified', 5: 'Optimized' };
const LEVEL_LABELS = { 0: 'L0 Strategic Domain', 1: 'L1 Capability Domain', 2: 'L2 Capability', 3: 'L3 Sub-Capability' };

export default function DetailPanel() {
  const selectedId = useStore(s => s.selectedId);
  const selectedType = useStore(s => s.selectedType);
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const setSelected = useStore(s => s.setSelected);
  const openModal = useStore(s => s.openModal);
  const deleteNode = useStore(s => s.deleteNode);
  const deleteEdge = useStore(s => s.deleteEdge);

  if (!selectedId) return null;

  const item = selectedType === 'edge'
    ? edges.find(e => e.id === selectedId)
    : nodes.find(n => n.id === selectedId);

  if (!item) return null;

  const isEdge = selectedType === 'edge';

  const handleEdit = () => {
    openModal({ mode: 'edit', type: isEdge ? 'edge' : 'node', data: item });
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${isEdge ? (item.metadata?.description || item.id) : item.name}"?`)) return;
    if (isEdge) deleteEdge(item.id);
    else deleteNode(item.id);
  };

  const m = item.metadata || {};
  const statusColors = STATUS_BADGE[m.status] || STATUS_BADGE.active;

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.title}>
          {isEdge ? '🔗 Integration' : (
            item.type === 'capability' ? '⬜ Capability' :
            item.type === 'application' ? '📦 Application' : '⚙️ Technology'
          )}
        </span>
        <button style={styles.closeBtn} onClick={() => setSelected(null, null)}>✕</button>
      </div>

      <div style={styles.body}>
        {/* Name / ID */}
        <div style={styles.row}>
          <div style={styles.label}>Name</div>
          <div style={{ ...styles.value, fontWeight: 700, fontSize: 14 }}>
            {isEdge ? `${getNodeName(item.source, nodes)} → ${getNodeName(item.target, nodes)}` : item.name}
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.label}>ID</div>
          <div style={{ ...styles.value, fontFamily: 'monospace', fontSize: 11, color: '#8c8c8c' }}>{item.id}</div>
        </div>

        <div style={styles.divider} />

        {/* Node-specific fields */}
        {!isEdge && (
          <>
            {item.type === 'capability' && (
              <>
                <div style={styles.row}>
                  <div style={styles.label}>TOGAF Level</div>
                  <div style={styles.value}>{LEVEL_LABELS[item.level] ?? item.level}</div>
                </div>
                <div style={styles.row}>
                  <div style={styles.label}>Category</div>
                  <div style={styles.value} title={item.category}>
                    <span style={{ textTransform: 'capitalize' }}>{item.category}</span>
                  </div>
                </div>
                {item.parent && (
                  <div style={styles.row}>
                    <div style={styles.label}>Parent</div>
                    <div style={styles.value}>{getNodeName(item.parent, nodes)}</div>
                  </div>
                )}
              </>
            )}
            {(item.type === 'application' || item.type === 'technology') && (
              <>
                {m.vendor && (
                  <div style={styles.row}>
                    <div style={styles.label}>Vendor</div>
                    <div style={styles.value}>{m.vendor}{m.version ? ` v${m.version}` : ''}</div>
                  </div>
                )}
              </>
            )}
            {m.owner && (
              <div style={styles.row}>
                <div style={styles.label}>Owner</div>
                <div style={styles.value}>{m.owner}</div>
              </div>
            )}
            <div style={styles.row}>
              <div style={styles.label}>Status</div>
              <span style={styles.badge(statusColors.bg, statusColors.border, statusColors.text)}>
                {m.status || 'active'}
              </span>
            </div>
            {m.maturity && (
              <div style={styles.row}>
                <div style={styles.label}>Maturity</div>
                <div style={styles.maturityRow}>
                  <div style={styles.maturityDot(MATURITY_COLORS[m.maturity] || '#ccc')} />
                  <span style={styles.value}>{m.maturity} — {MATURITY_LABELS[m.maturity]}</span>
                </div>
              </div>
            )}
            {m.description && (
              <div style={styles.row}>
                <div style={styles.label}>Description</div>
                <div style={{ ...styles.value, color: '#595959' }}>{m.description}</div>
              </div>
            )}
            {m.tags?.length > 0 && (
              <div style={styles.row}>
                <div style={styles.label}>Tags</div>
                <div style={styles.tagList}>
                  {m.tags.map(t => <span key={t} style={styles.tag}>{t}</span>)}
                </div>
              </div>
            )}
          </>
        )}

        {/* Edge-specific fields */}
        {isEdge && (
          <>
            <div style={styles.row}>
              <div style={styles.label}>Source</div>
              <div style={styles.value}>{getNodeName(item.source, nodes)}</div>
            </div>
            <div style={styles.row}>
              <div style={styles.label}>Target</div>
              <div style={styles.value}>{getNodeName(item.target, nodes)}</div>
            </div>
            <div style={styles.row}>
              <div style={styles.label}>Protocol</div>
              <span style={styles.badge(
                `${PROTOCOL_COLORS[item.protocol] || '#8c8c8c'}22`,
                PROTOCOL_COLORS[item.protocol] || '#8c8c8c',
                PROTOCOL_COLORS[item.protocol] || '#595959'
              )}>
                {item.protocol}
              </span>
            </div>
            <div style={styles.row}>
              <div style={styles.label}>Direction</div>
              <div style={styles.value}>{item.direction === 'bi' ? '↔ Bidirectional' : '→ Unidirectional'}</div>
            </div>
            {m.frequency && (
              <div style={styles.row}>
                <div style={styles.label}>Frequency</div>
                <div style={styles.value}>{m.frequency}</div>
              </div>
            )}
            {m.criticality && (
              <div style={styles.row}>
                <div style={styles.label}>Criticality</div>
                <CriticalityBadge value={m.criticality} />
              </div>
            )}
            {m.description && (
              <div style={styles.row}>
                <div style={styles.label}>Description</div>
                <div style={{ ...styles.value, color: '#595959' }}>{m.description}</div>
              </div>
            )}
            {m.dataEntities?.length > 0 && (
              <div style={styles.row}>
                <div style={styles.label}>Data Entities</div>
                <div style={styles.tagList}>
                  {m.dataEntities.map(e => <span key={e} style={styles.tag}>{e}</span>)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div style={styles.footer}>
        <button style={styles.btn('primary')} onClick={handleEdit}>Edit</button>
        <button style={styles.btn('danger')} onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
}

function getNodeName(id, nodes) {
  return nodes.find(n => n.id === id)?.name || id;
}

function CriticalityBadge({ value }) {
  const colors = {
    high:   { bg: '#fff1f0', border: '#ff4d4f', text: '#cf1322' },
    medium: { bg: '#fff7e6', border: '#fa8c16', text: '#d46b08' },
    low:    { bg: '#f6ffed', border: '#52c41a', text: '#389e0d' },
  };
  const c = colors[value] || colors.medium;
  return <span style={styles.badge(c.bg, c.border, c.text)}>{value}</span>;
}
