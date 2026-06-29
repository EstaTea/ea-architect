import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import useStore from '../store.js';

cytoscape.use(fcose);

const CytoscapeCanvas = forwardRef(function CytoscapeCanvas(
  { elements, styles, layout, onCyReady },
  ref
) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const setSelected = useStore(s => s.setSelected);

  useImperativeHandle(ref, () => ({
    getCy: () => cyRef.current,
    runLayout: (layoutConfig) => cyRef.current?.layout(layoutConfig).run(),
    fit: () => cyRef.current?.fit(undefined, 50),
  }));

  // 初始化 Cytoscape 实例（只执行一次）
  useEffect(() => {
    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: styles,
      wheelSensitivity: 0.3,
      minZoom: 0.1,
      maxZoom: 4,
    });
    cyRef.current = cy;

    cy.on('tap', 'node', (evt) => {
      setSelected(evt.target.id(), 'node');
    });
    cy.on('tap', 'edge', (evt) => {
      setSelected(evt.target.id(), 'edge');
    });
    cy.on('tap', (evt) => {
      if (evt.target === cy) setSelected(null, null);
    });

    onCyReady?.(cy);

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 数据更新时同步到 Cytoscape（不重建实例）
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.json({ elements });
    cy.layout(layout).run();
  }, [elements]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', background: '#fafafa' }}
    />
  );
});

export default CytoscapeCanvas;
