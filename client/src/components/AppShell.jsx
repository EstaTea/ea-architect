import React, { useRef } from 'react';
import useStore from '../store.js';
import Sidebar from './Sidebar.jsx';
import ViewToolbar from './ViewToolbar.jsx';
import CapabilityMapView from './CapabilityMapView.jsx';
import IntegrationView from './IntegrationView.jsx';
import DetailPanel from './DetailPanel.jsx';
import NodeForm from './NodeForm.jsx';
import EdgeForm from './EdgeForm.jsx';

export default function AppShell() {
  const currentView = useStore(s => s.currentView);
  const selectedId = useStore(s => s.selectedId);
  const capCanvasRef = useRef(null);
  const intCanvasRef = useRef(null);
  const canvasRef = currentView === 'capability' ? capCanvasRef : intCanvasRef;

  const showDetail = !!selectedId;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `260px 1fr ${showDetail ? '300px' : '0px'}`,
      gridTemplateRows: '52px 1fr',
      height: '100vh',
      overflow: 'hidden',
      transition: 'grid-template-columns 0.2s ease',
    }}>
      {/* 顶部导航栏 - 跨越右两列 */}
      <div style={{
        gridColumn: '1 / -1',
        gridRow: '1',
        display: 'flex',
        alignItems: 'center',
        background: '#001529',
        padding: '0 20px',
        gap: 16,
        zIndex: 10,
      }}>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '0.02em', flexShrink: 0 }}>
          EA Architect
        </div>
        <div style={{ width: 1, height: 20, background: '#ffffff30' }} />
        <div style={{ color: '#ffffff80', fontSize: 11 }}>Enterprise Architecture Management Tool</div>
        <div style={{ flex: 1 }} />
        <div style={{ color: '#ffffff60', fontSize: 11 }}>TOGAF · SAP Reference Architecture</div>
      </div>

      {/* 左侧边栏 */}
      <div style={{ gridColumn: '1', gridRow: '2', overflow: 'hidden' }}>
        <Sidebar />
      </div>

      {/* 主画布区域（包含工具栏） */}
      <div style={{ gridColumn: '2', gridRow: '2', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <ViewToolbar canvasRef={canvasRef} />
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* 能力地图视图 */}
          <div style={{
            position: 'absolute', inset: 0,
            visibility: currentView === 'capability' ? 'visible' : 'hidden',
            pointerEvents: currentView === 'capability' ? 'auto' : 'none',
          }}>
            <CapabilityMapView canvasRef={capCanvasRef} />
          </div>
          {/* 集成架构视图 */}
          <div style={{
            position: 'absolute', inset: 0,
            visibility: currentView === 'integration' ? 'visible' : 'hidden',
            pointerEvents: currentView === 'integration' ? 'auto' : 'none',
          }}>
            <IntegrationView canvasRef={intCanvasRef} />
          </div>
        </div>
      </div>

      {/* 右侧详情面板 */}
      <div style={{
        gridColumn: '3',
        gridRow: '2',
        overflow: 'hidden',
        width: showDetail ? 300 : 0,
        transition: 'width 0.2s ease',
      }}>
        {showDetail && <DetailPanel />}
      </div>

      {/* 模态窗口（全局，挂载在顶层） */}
      <NodeForm />
      <EdgeForm />
    </div>
  );
}
