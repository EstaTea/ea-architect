import React, { useMemo } from 'react';
import CytoscapeCanvas from './CytoscapeCanvas.jsx';
import { capabilityStyles, MATURITY_COLORS } from '../cytoscapeStyles.js';
import { computeCapabilityLayout } from '../layoutUtils.js';
import useStore from '../store.js';

// preset 布局：使用算法预计算的坐标，不让 Cytoscape 重排
const PRESET_LAYOUT = { name: 'preset', fit: true, padding: 60 };

export default function CapabilityMapView({ canvasRef }) {
  const nodes = useStore(s => s.nodes);
  const capNodes = useMemo(() => nodes.filter(n => n.type === 'capability'), [nodes]);

  // 计算网格布局坐标
  const layout = useMemo(() => computeCapabilityLayout(capNodes), [capNodes]);

  const elements = useMemo(() => {
    return capNodes.map(n => {
      const pos = layout[n.id];
      return {
        data: {
          id: n.id,
          name: n.name,
          // 关键：不设 parent，全部平铺，用 z-index 控制层叠顺序
          type: n.type,
          level: n.level,
          maturityColor: MATURITY_COLORS[n.metadata?.maturity] || '#f0f0f0',
          category: n.category,
        },
        position: pos?.position,
        // 直接在 element 上设 width/height，Cytoscape 不会被 compound 逻辑覆盖
        style: pos ? { width: pos.width, height: pos.height } : {},
      };
    });
  }, [capNodes, layout]);

  return (
    <CytoscapeCanvas
      ref={canvasRef}
      elements={elements}
      styles={capabilityStyles}
      layout={PRESET_LAYOUT}
    />
  );
}
