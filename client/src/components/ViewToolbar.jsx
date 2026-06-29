import React from 'react';
import useStore from '../store.js';
import { PROTOCOL_COLORS } from '../cytoscapeStyles.js';

const styles = {
  toolbar: {
    height: 52,
    background: '#fff',
    borderBottom: '1px solid #e8e8e8',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: 12,
    flexShrink: 0,
  },
  viewTabs: { display: 'flex', gap: 0, border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' },
  tab: (active) => ({
    padding: '6px 16px', fontSize: 12, fontWeight: active ? 700 : 500,
    background: active ? '#1890ff' : '#fff',
    color: active ? '#fff' : '#595959',
    border: 'none', cursor: 'pointer',
    borderRight: '1px solid #d9d9d9',
    transition: 'background 0.15s, color 0.15s',
  }),
  search: {
    padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 6,
    fontSize: 12, outline: 'none', width: 200,
  },
  iconBtn: (active) => ({
    padding: '5px 12px', border: '1px solid #d9d9d9', borderRadius: 6,
    background: active ? '#e6f7ff' : '#fff', color: active ? '#0050b3' : '#595959',
    cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5,
  }),
  spacer: { flex: 1 },
  legend: { display: 'flex', alignItems: 'center', gap: 8 },
  legendItem: (color) => ({
    display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#595959',
  }),
  legendDot: (color) => ({
    width: 10, height: 3, background: color, borderRadius: 2,
  }),
};

export default function ViewToolbar({ canvasRef }) {
  const currentView = useStore(s => s.currentView);
  const setCurrentView = useStore(s => s.setCurrentView);
  const searchQuery = useStore(s => s.searchQuery);
  const setSearchQuery = useStore(s => s.setSearchQuery);
  const exportJSON = useStore(s => s.exportJSON);

  const handleSearch = (q) => {
    setSearchQuery(q);
    const cy = canvasRef?.current?.getCy();
    if (!cy) return;
    cy.elements().removeClass('highlighted dimmed');
    if (!q.trim()) return;
    const matched = cy.elements().filter(el =>
      (el.data('name') || '').toLowerCase().includes(q.toLowerCase())
    );
    if (matched.length > 0) {
      matched.addClass('highlighted');
      // 对于 compound nodes，高亮祖先节点
      matched.nodes().ancestors().addClass('highlighted');
      cy.elements().not(matched).not(matched.nodes().ancestors()).addClass('dimmed');
    }
  };

  const handleRelayout = () => {
    canvasRef?.current?.runLayout(
      currentView === 'integration'
        ? {
            name: 'fcose', quality: 'default', randomize: true,
            animate: true, animationDuration: 800,
            nodeRepulsion: 8000, idealEdgeLength: 180,
            fit: true, padding: 60,
          }
        : { name: 'preset', fit: true, padding: 60 }
    );
  };

  const handleFit = () => canvasRef?.current?.fit();

  return (
    <div style={styles.toolbar}>
      {/* 视图切换 */}
      <div style={styles.viewTabs}>
        <button
          style={{ ...styles.tab(currentView === 'capability'), borderRight: '1px solid #d9d9d9' }}
          onClick={() => setCurrentView('capability')}
        >
          ⬛ Capability Map
        </button>
        <button
          style={{ ...styles.tab(currentView === 'integration'), borderRight: 'none' }}
          onClick={() => setCurrentView('integration')}
        >
          🔗 Integration Landscape
        </button>
      </div>

      {/* 搜索 */}
      <input
        style={styles.search}
        placeholder="Search nodes..."
        value={searchQuery}
        onChange={e => handleSearch(e.target.value)}
      />

      {/* 操作按钮 */}
      <button style={styles.iconBtn(false)} onClick={handleRelayout} title="Re-run layout">
        ⟳ Layout
      </button>
      <button style={styles.iconBtn(false)} onClick={handleFit} title="Fit to screen">
        ⊞ Fit
      </button>

      <div style={styles.spacer} />

      {/* 图例（集成视图时显示） */}
      {currentView === 'integration' && (
        <div style={styles.legend}>
          {Object.entries(PROTOCOL_COLORS).slice(0, 5).map(([proto, color]) => (
            <div key={proto} style={styles.legendItem(color)}>
              <div style={styles.legendDot(color)} />
              <span>{proto}</span>
            </div>
          ))}
        </div>
      )}

      {/* 导出 */}
      <button style={styles.iconBtn(false)} onClick={exportJSON} title="Export JSON">
        ↓ Export
      </button>
    </div>
  );
}
