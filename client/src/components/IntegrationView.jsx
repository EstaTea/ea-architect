import React, { useMemo, useEffect } from 'react';
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

  const appNodes = useMemo(
    () => nodes.filter(n => n.type === 'application' || n.type === 'technology'),
    [nodes]
  );
  const intEdges = useMemo(
    () => edges.filter(e => e.type === 'integration'),
    [edges]
  );

  const elements = useMemo(() => [
    ...appNodes.map(n => ({
      data: {
        id: n.id,
        name: n.name,
        type: n.type,
        vendor: n.metadata?.vendor || '',
        status: n.metadata?.status || 'active',
      }
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
  ], [appNodes, intEdges]);

  // 收到父页面 postMessage('ea:fit') 时重新布局（解决 iframe 初始高度为0的问题）
  useEffect(() => {
    const handler = () => {
      const cy = canvasRef?.current?.getCy();
      if (cy) {
        cy.layout({ ...FCOSE_LAYOUT, randomize: true }).run();
      }
    };
    window.addEventListener('ea-refit', handler);
    return () => window.removeEventListener('ea-refit', handler);
  }, [canvasRef]);

  return (
    <CytoscapeCanvas
      ref={canvasRef}
      elements={elements}
      styles={integrationStyles}
      layout={FCOSE_LAYOUT}
    />
  );
}
