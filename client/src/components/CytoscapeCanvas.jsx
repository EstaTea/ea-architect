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
  const prevElementsRef = useRef(null);

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

    cy.on('tap', 'node', (evt) => { setSelected(evt.target.id(), 'node'); });
    cy.on('tap', 'edge', (evt) => { setSelected(evt.target.id(), 'edge'); });
    cy.on('tap', (evt) => { if (evt.target === cy) setSelected(null, null); });

    onCyReady?.(cy);

    return () => { cy.destroy(); cyRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 数据更新时增量同步——不覆盖已有节点位置
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const newIds = new Set(elements.map(el => el.data.id));
    const oldIds = new Set(cy.elements().map(el => el.id()));

    // 删除不再存在的元素
    cy.elements().filter(el => !newIds.has(el.id())).remove();

    // 新增不存在的元素（保留已有元素的位置不变）
    elements.forEach(el => {
      if (!oldIds.has(el.data.id)) {
        cy.add(el);
      }
      // 更新 data（不动 position）
      const existing = cy.getElementById(el.data.id);
      if (existing.length) {
        existing.data(el.data);
        // 只有 element 声明了 style 才应用（capability map 的 width/height）
        if (el.style) existing.style(el.style);
      }
    });

    const isFirstLoad = prevElementsRef.current === null;
    prevElementsRef.current = elements;

    // 首次加载或没有 preset 位置时才跑布局
    const isPreset = layout.name === 'preset';
    if (isFirstLoad || !isPreset) {
      cy.layout(layout).run();
    } else if (isFirstLoad && isPreset) {
      cy.fit(undefined, 60);
    }
  }, [elements]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', background: '#fafafa' }}
    />
  );
});

export default CytoscapeCanvas;
