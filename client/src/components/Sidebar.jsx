import React from 'react';
import useStore from '../store.js';

const CATEGORY_ICON = { capability: '⬜', application: '📦', technology: '⚙️' };
const MATURITY_COLORS = { 1: '#d73027', 2: '#fc8d59', 3: '#fee090', 4: '#91bfdb', 5: '#4575b4' };

const styles = {
  sidebar: {
    width: 260,
    height: '100%',
    background: '#fff',
    borderRight: '1px solid #e8e8e8',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '12px 14px',
    borderBottom: '1px solid #f0f0f0',
    background: '#fafafa',
  },
  headerTitle: { fontSize: 12, fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.05em' },
  addBtns: { display: 'flex', gap: 6, marginTop: 8 },
  addBtn: (color) => ({
    flex: 1, padding: '5px 0', fontSize: 11, fontWeight: 600,
    border: `1px solid ${color}`, background: `${color}15`, color,
    borderRadius: 4, cursor: 'pointer',
  }),
  list: { flex: 1, overflowY: 'auto', padding: '6px 0' },
  section: { marginBottom: 2 },
  sectionHeader: {
    padding: '6px 14px', fontSize: 11, fontWeight: 700,
    color: '#595959', background: '#f5f5f5',
    textTransform: 'uppercase', letterSpacing: '0.04em',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  sectionCount: { fontSize: 10, color: '#8c8c8c', fontWeight: 400 },
  item: (selected, depth) => ({
    padding: `5px 14px 5px ${14 + depth * 14}px`,
    fontSize: 12,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: selected ? '#e6f7ff' : 'transparent',
    color: selected ? '#0050b3' : '#262626',
    borderLeft: selected ? '2px solid #1890ff' : '2px solid transparent',
    transition: 'background 0.1s',
  }),
  dot: (color) => ({
    width: 8, height: 8, borderRadius: 2,
    background: color, flexShrink: 0,
  }),
  itemName: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  footer: {
    padding: '10px 14px',
    borderTop: '1px solid #f0f0f0',
    background: '#fafafa',
  },
  statsRow: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c8c8c' },
};

export default function Sidebar() {
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const selectedId = useStore(s => s.selectedId);
  const setSelected = useStore(s => s.setSelected);
  const openModal = useStore(s => s.openModal);
  const currentView = useStore(s => s.currentView);

  const capabilities = buildCapabilityTree(nodes.filter(n => n.type === 'capability'));
  const applications = nodes.filter(n => n.type === 'application');
  const technologies = nodes.filter(n => n.type === 'technology');
  const integrations = edges.filter(e => e.type === 'integration');

  const handleItemClick = (id) => setSelected(id, 'node');

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>Architecture Navigator</div>
        <div style={styles.addBtns}>
          <button style={styles.addBtn('#5c6bc0')} onClick={() => openModal({ mode: 'add', type: 'node', data: { defaultType: 'capability' } })}>
            + Capability
          </button>
          <button style={styles.addBtn('#1890ff')} onClick={() => openModal({ mode: 'add', type: 'node', data: { defaultType: 'application' } })}>
            + App
          </button>
          <button style={styles.addBtn('#52c41a')} onClick={() => openModal({ mode: 'add', type: 'edge' })}>
            + Integration
          </button>
        </div>
      </div>

      <div style={styles.list}>
        {/* Capabilities */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            Capabilities
            <span style={styles.sectionCount}>{capabilities.length} root</span>
          </div>
          {capabilities.map(root => (
            <CapabilityItem
              key={root.id}
              node={root}
              depth={0}
              selectedId={selectedId}
              onSelect={handleItemClick}
            />
          ))}
        </div>

        {/* Applications */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            Applications
            <span style={styles.sectionCount}>{applications.length}</span>
          </div>
          {applications.map(n => (
            <div
              key={n.id}
              style={styles.item(selectedId === n.id, 0)}
              onClick={() => handleItemClick(n.id)}
            >
              <span>📦</span>
              <span style={styles.itemName}>{n.name}</span>
              {n.metadata?.vendor && (
                <span style={{ fontSize: 10, color: '#8c8c8c', flexShrink: 0 }}>{n.metadata.vendor}</span>
              )}
            </div>
          ))}
        </div>

        {/* Technologies */}
        {technologies.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              Technologies
              <span style={styles.sectionCount}>{technologies.length}</span>
            </div>
            {technologies.map(n => (
              <div
                key={n.id}
                style={styles.item(selectedId === n.id, 0)}
                onClick={() => handleItemClick(n.id)}
              >
                <span>⚙️</span>
                <span style={styles.itemName}>{n.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Integrations */}
        {integrations.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              Integrations
              <span style={styles.sectionCount}>{integrations.length}</span>
            </div>
            {integrations.slice(0, 12).map(e => (
              <div
                key={e.id}
                style={{
                  ...styles.item(selectedId === e.id, 0),
                  color: selectedId === e.id ? '#0050b3' : '#595959',
                }}
                onClick={() => setSelected(e.id, 'edge')}
              >
                <span style={{ fontSize: 10 }}>🔗</span>
                <span style={styles.itemName}>
                  {getNodeName(e.source, nodes)} → {getNodeName(e.target, nodes)}
                </span>
                <span style={{ fontSize: 10, color: '#8c8c8c', flexShrink: 0 }}>{e.protocol}</span>
              </div>
            ))}
            {integrations.length > 12 && (
              <div style={{ padding: '4px 14px', fontSize: 11, color: '#8c8c8c' }}>
                +{integrations.length - 12} more...
              </div>
            )}
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <div style={styles.statsRow}>
          <span>{nodes.length} nodes</span>
          <span>{edges.length} integrations</span>
        </div>
      </div>
    </div>
  );
}

function CapabilityItem({ node, depth, selectedId, onSelect }) {
  const [expanded, setExpanded] = React.useState(depth < 1);
  const hasChildren = node.children?.length > 0;
  const maturityColor = MATURITY_COLORS[node.metadata?.maturity] || '#e8e8e8';

  return (
    <>
      <div style={styles.item(selectedId === node.id, depth)} onClick={() => onSelect(node.id)}>
        {hasChildren && (
          <span
            style={{ fontSize: 9, color: '#8c8c8c', cursor: 'pointer', flexShrink: 0, width: 12 }}
            onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
          >
            {expanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span style={{ width: 12, flexShrink: 0 }} />}
        <div style={styles.dot(maturityColor)} />
        <span style={styles.itemName}>{node.name}</span>
        <span style={{ fontSize: 9, color: '#bbb', flexShrink: 0 }}>L{node.level}</span>
      </div>
      {expanded && hasChildren && node.children.map(child => (
        <CapabilityItem
          key={child.id}
          node={child}
          depth={depth + 1}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

function buildCapabilityTree(nodes) {
  const map = {};
  nodes.forEach(n => { map[n.id] = { ...n, children: [] }; });
  const roots = [];
  nodes.forEach(n => {
    if (n.parent && map[n.parent]) {
      map[n.parent].children.push(map[n.id]);
    } else if (!n.parent) {
      roots.push(map[n.id]);
    }
  });
  return roots;
}

function getNodeName(id, nodes) {
  return nodes.find(n => n.id === id)?.name || id;
}
