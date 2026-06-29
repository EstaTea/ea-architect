import React, { useMemo, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import useStore from '../store.js';

const MATURITY_COLORS = { 1:'#d73027', 2:'#fc8d59', 3:'#fee090', 4:'#91bfdb', 5:'#4575b4' };
const MATURITY_LABELS = { 1:'Initial', 2:'Managed', 3:'Defined', 4:'Quantified', 5:'Optimized' };
const CATEGORY_COLORS = {
  core:       { l0bg:'#e8eaf6', l0border:'#3949ab', l1bg:'#c5cae9', l1border:'#5c6bc0' },
  supporting: { l0bg:'#e8f5e9', l0border:'#388e3c', l1bg:'#c8e6c9', l1border:'#43a047' },
  strategic:  { l0bg:'#fff8e1', l0border:'#f57c00', l1bg:'#ffe082', l1border:'#ffa000' },
};

const CapabilityMapView = forwardRef(function CapabilityMapView(_props, ref) {
  const nodes = useStore(s => s.nodes);
  const selectedId = useStore(s => s.selectedId);
  const searchQuery = useStore(s => s.searchQuery);
  const setSelected = useStore(s => s.setSelected);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(0.85);

  // 暴露给 ViewToolbar 的接口
  useImperativeHandle(ref, () => ({
    getCy: () => null,
    runLayout: () => { setZoom(0.85); },
    fit: () => { setZoom(0.85); containerRef.current?.scrollTo(0, 0); },
  }));

  const capNodes = useMemo(() => nodes.filter(n => n.type === 'capability'), [nodes]);
  const roots = useMemo(() => buildTree(capNodes), [capNodes]);

  const q = searchQuery.trim().toLowerCase();

  return (
    <div
      ref={containerRef}
      style={{ width:'100%', height:'100%', overflow:'auto', background:'#f0f2f7' }}
      onClick={e => { if (e.target === e.currentTarget) setSelected(null, null); }}
    >
      {/* 缩放容器 */}
      <div style={{ padding: 32, display:'inline-flex', gap: 20, minWidth:'max-content',
        transformOrigin:'top left', transform:`scale(${zoom})` }}>
        {roots.map(root => (
          <L0Block key={root.id} node={root}
            selectedId={selectedId} onSelect={setSelected} query={q} />
        ))}
      </div>

      {/* 图例 */}
      <div style={{ position:'fixed', bottom:80, right:24, background:'#fff',
        border:'1px solid #e8e8e8', borderRadius:6, padding:'8px 12px',
        fontSize:11, color:'#595959', zIndex:100, boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ fontWeight:700, marginBottom:6, color:'#262626' }}>Maturity</div>
        {Object.entries(MATURITY_COLORS).map(([k, color]) => (
          <div key={k} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
            <div style={{ width:14, height:10, background:color, borderRadius:2 }} />
            <span>{k} — {MATURITY_LABELS[k]}</span>
          </div>
        ))}
      </div>

      {/* 缩放控制 */}
      <div style={{ position:'fixed', bottom:24, right:24, display:'flex',
        gap:4, zIndex:100 }}>
        <ZoomBtn onClick={() => setZoom(z => Math.min(2, +(z+0.1).toFixed(1)))}>＋</ZoomBtn>
        <ZoomBtn onClick={() => setZoom(0.85)} title="Reset zoom">
          {Math.round(zoom*100)}%
        </ZoomBtn>
        <ZoomBtn onClick={() => setZoom(z => Math.max(0.3, +(z-0.1).toFixed(1)))}>－</ZoomBtn>
      </div>
    </div>
  );
});

export default CapabilityMapView;

/* ── 层级组件 ──────────────────────────────────────────────── */

function L0Block({ node, selectedId, onSelect, query }) {
  const c = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.core;
  const selected = selectedId === node.id;
  const dimmed = query && !node.name.toLowerCase().includes(query);

  return (
    <div
      style={{
        background: c.l0bg,
        border: `2px solid ${selected ? '#0050b3' : c.l0border}`,
        borderRadius: 8,
        padding: '10px 14px 14px',
        cursor: 'pointer',
        opacity: dimmed ? 0.35 : 1,
        boxShadow: selected ? `0 0 0 3px rgba(0,80,179,0.25), 0 4px 16px rgba(0,0,0,0.12)`
          : '0 2px 10px rgba(0,0,0,0.1)',
        transition: 'opacity 0.2s, box-shadow 0.15s',
        minWidth: 280,
      }}
      onClick={e => { e.stopPropagation(); onSelect(node.id, 'node'); }}
    >
      <div style={{ fontSize:12, fontWeight:800, color: c.l0border,
        textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>
        {node.name}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {(node.children || []).map(child => (
          <L1Block key={child.id} node={child}
            selectedId={selectedId} onSelect={onSelect}
            query={query} colors={c} />
        ))}
      </div>
    </div>
  );
}

function L1Block({ node, selectedId, onSelect, query, colors }) {
  const selected = selectedId === node.id;
  const children = node.children || [];
  const cols = Math.min(children.length || 1, 4);
  const dimmed = query && !node.name.toLowerCase().includes(query)
    && !children.some(c => c.name.toLowerCase().includes(query));

  return (
    <div
      style={{
        background: colors.l1bg,
        border: `1.5px solid ${selected ? '#0050b3' : colors.l1border}`,
        borderRadius: 5,
        padding: '6px 10px 10px',
        cursor: 'pointer',
        opacity: dimmed ? 0.35 : 1,
        boxShadow: selected ? '0 0 0 2px rgba(0,80,179,0.3)' : 'none',
        transition: 'opacity 0.2s',
      }}
      onClick={e => { e.stopPropagation(); onSelect(node.id, 'node'); }}
    >
      <div style={{ fontSize:11, fontWeight:700, color:'#283593', marginBottom:8 }}>
        {node.name}
      </div>
      {children.length > 0 && (
        <div style={{ display:'grid',
          gridTemplateColumns:`repeat(${cols}, minmax(130px, 1fr))`, gap:6 }}>
          {children.map(child => (
            <L2Cell key={child.id} node={child}
              selectedId={selectedId} onSelect={onSelect} query={query} />
          ))}
        </div>
      )}
    </div>
  );
}

function L2Cell({ node, selectedId, onSelect, query }) {
  const selected = selectedId === node.id;
  const bg = MATURITY_COLORS[node.metadata?.maturity] || '#e0e0e0';
  const isDark = node.metadata?.maturity === 1 || node.metadata?.maturity === 5;
  const textColor = isDark ? '#fff' : '#111';
  const dimmed = query && !node.name.toLowerCase().includes(query);

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${selected ? '#0050b3' : 'rgba(0,0,0,0.18)'}`,
        borderRadius: 4,
        minHeight: 58,
        padding: '8px 10px',
        display:'flex', alignItems:'center', justifyContent:'center',
        textAlign:'center',
        fontSize: 11, fontWeight:600, color: textColor, lineHeight: 1.35,
        cursor: 'pointer',
        opacity: dimmed ? 0.3 : 1,
        boxShadow: selected ? '0 0 0 3px rgba(0,80,179,0.45)' : 'none',
        transition: 'opacity 0.2s, transform 0.1s',
      }}
      onClick={e => { e.stopPropagation(); onSelect(node.id, 'node'); }}
      title={`${node.name}\nMaturity: ${MATURITY_LABELS[node.metadata?.maturity] || '—'}\nStatus: ${node.metadata?.status || '—'}\nOwner: ${node.metadata?.owner || '—'}`}
    >
      {node.name}
    </div>
  );
}

function ZoomBtn({ children, onClick, title }) {
  return (
    <button onClick={onClick} title={title} style={{
      minWidth:36, height:32, border:'1px solid #d9d9d9', borderRadius:4,
      background:'#fff', cursor:'pointer', fontSize:13, fontWeight:700,
      padding:'0 8px', boxShadow:'0 1px 4px rgba(0,0,0,0.1)',
      color:'#262626',
    }}>
      {children}
    </button>
  );
}

/* ── 树构建工具 ─────────────────────────────────────────────── */
function buildTree(nodes) {
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
