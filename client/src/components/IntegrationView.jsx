import React, { useMemo, useEffect, useRef } from 'react';
import CytoscapeCanvas from './CytoscapeCanvas.jsx';
import { integrationStyles } from '../cytoscapeStyles.js';
import useStore from '../store.js';

const FCOSE_LAYOUT = {
  name: 'fcose',
  quality: 'default',
  randomize: true,
  animate: true,
  animationDuration: 600,
  nodeRepulsion: 8000,
  idealEdgeLength: 180,
  edgeElasticity: 0.4,
  numIter: 2500,
  gravity: 0.25,
  gravityRange: 3.8,
  nodeSeparation: 80,
  fit: true,
  padding: 60,
};

export default function IntegrationView({ canvasRef }) {
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const positions = useStore(s => s.positions);
  const savePositions = useStore(s => s.savePositions);
  const hasPositions = Object.keys(positions).length > 0;
  const saveTimer = useRef(null);

  const appNodes = useMemo(
    () => nodes.filter(n => n.type === 'application' || n.type === 'technology'),
    [nodes]
  );
  const intEdges = useMemo(
    () => edges.filter(e => e.type === 'integration'),
    [edges]
  );

  // 有保存位置时用 preset 恢复，没有时用 fcose 重新计算
  const layout = useMemo(() => {
    if (hasPositions) return { name: 'preset', fit: true, padding: 60 };
    return FCOSE_LAYOUT;
  }, [hasPositions]);

  const elements = useMemo(() => [
    ...appNodes.map(n => ({
      data: {
        id: n.id,
        name: n.name,
        type: n.type,
        vendor: n.metadata?.vendor || '',
        status: n.metadata?.status || 'active',
      },
      // 有保存位置则使用
      ...(positions[n.id] ? { position: positions[n.id] } : {}),
    })),
    ...intEdges.map(e => ({
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        protocol: e.protocol || 'CUSTOM',
        direction: e.direction || 'uni',
        description: e.metadata?.description || '',
      }
    }))
  ], [appNodes, intEdges, positions]);

  // 布局完成或拖拽结束后保存所有节点位置
  const handleCyReady = (cy) => {
    const persistPositions = () => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const pos = {};
        cy.nodes().forEach(n => {
          const p = n.position();
          pos[n.id()] = { x: Math.round(p.x), y: Math.round(p.y) };
        });
        savePositions(pos);
      }, 800); // 拖拽停止800ms后保存，防止频繁写入
    };

    cy.on('dragfree', 'node', persistPositions);
    cy.on('layoutstop', persistPositions);
  };

  // 收到父页面 postMessage('ea:fit') 时重新布局
  useEffect(() => {
    const handler = () => {
      const cy = canvasRef?.current?.getCy();
      if (cy) {
        if (hasPositions) {
          cy.fit(undefined, 60);
        } else {
          cy.layout({ ...FCOSE_LAYOUT, randomize: true }).run();
        }
      }
    };
    window.addEventListener('ea-refit', handler);
    return () => window.removeEventListener('ea-refit', handler);
  }, [canvasRef, hasPositions]);

  return (
    <CytoscapeCanvas
      ref={canvasRef}
      elements={elements}
      styles={integrationStyles}
      layout={layout}
      onCyReady={handleCyReady}
    />
  );
}
