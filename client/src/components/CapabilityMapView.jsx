import React, { useMemo, useRef, useEffect } from 'react';
import CytoscapeCanvas from './CytoscapeCanvas.jsx';
import { capabilityStyles, MATURITY_COLORS } from '../cytoscapeStyles.js';
import { computeCapabilityLayout } from '../layoutUtils.js';
import useStore from '../store.js';

const PRESET_LAYOUT = { name: 'preset', fit: true, padding: 60 };

export default function CapabilityMapView({ canvasRef }) {
  const nodes = useStore(s => s.nodes);
  const capNodes = useMemo(() => nodes.filter(n => n.type === 'capability'), [nodes]);

  // 计算网格布局坐标
  const layout = useMemo(() => computeCapabilityLayout(capNodes), [capNodes]);

  // 构建 Cytoscape elements（compound nodes 使用 parent 字段）
  const elements = useMemo(() => {
    return capNodes.map(n => ({
      data: {
        id: n.id,
        name: n.name,
        parent: n.parent || undefined,
        type: n.type,
        level: n.level,
        maturityColor: MATURITY_COLORS[n.metadata?.maturity] || '#f5f5f5',
        category: n.category,
      },
      position: layout[n.id]?.position,
    }));
  }, [capNodes, layout]);

  const handleCyReady = (cy) => {
    applyCompoundSizes(cy, layout);
  };

  // 数据变更时重新设置 compound 尺寸（layout 完成后）
  const prevLayoutRef = useRef(null);
  useEffect(() => {
    if (prevLayoutRef.current === layout) return;
    prevLayoutRef.current = layout;
    // 通过 ref 获取 cy 实例
    const cy = canvasRef?.current?.getCy();
    if (cy) applyCompoundSizes(cy, layout);
  }, [layout, canvasRef]);

  return (
    <CytoscapeCanvas
      ref={canvasRef}
      elements={elements}
      styles={capabilityStyles}
      layout={PRESET_LAYOUT}
      onCyReady={handleCyReady}
    />
  );
}

function applyCompoundSizes(cy, layout) {
  Object.entries(layout).forEach(([id, pos]) => {
    const el = cy.getElementById(id);
    if (el.length && (pos.width || pos.height)) {
      el.style({ width: pos.width, height: pos.height });
    }
  });
}
