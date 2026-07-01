// 成熟度热力图颜色（1=初始/红 → 5=优化/深蓝）
export const MATURITY_COLORS = {
  1: '#d73027',
  2: '#fc8d59',
  3: '#fee090',
  4: '#91bfdb',
  5: '#4575b4',
};

export const STATUS_BADGE = {
  active:   { bg: '#f6ffed', border: '#52c41a', text: '#389e0d' },
  planned:  { bg: '#e6f7ff', border: '#1890ff', text: '#0050b3' },
  retiring: { bg: '#fff7e6', border: '#fa8c16', text: '#d46b08' },
  sunset:   { bg: '#f5f5f5', border: '#d9d9d9', text: '#8c8c8c' },
};

export const PROTOCOL_COLORS = {
  REST:   '#1890ff',
  SOAP:   '#722ed1',
  MQ:     '#fa8c16',
  DB:     '#13c2c2',
  FILE:   '#8c8c8c',
  EDI:    '#52c41a',
  CUSTOM: '#eb2f96',
};

// 能力地图样式（Capability Map）
// 不使用 compound nodes，用 z-index 实现视觉层叠：L0 底层 → L2 顶层
export const capabilityStyles = [
  {
    selector: 'node[type="capability"][level=0]',
    style: {
      'shape': 'rectangle',
      'background-color': '#dde3ed',
      'background-opacity': 1,
      'border-color': '#1a1a2e',
      'border-width': 2,
      'label': 'data(name)',
      'text-valign': 'top',
      'text-halign': 'center',
      'font-size': '13px',
      'font-weight': 'bold',
      'color': '#1a1a2e',
      'text-margin-y': 10,
      'text-wrap': 'wrap',
      'text-max-width': '300px',
      'z-index': 1,
    }
  },
  {
    selector: 'node[type="capability"][level=1]',
    style: {
      'shape': 'rectangle',
      'background-color': '#c5cae9',
      'background-opacity': 1,
      'border-color': '#5c6bc0',
      'border-width': 1.5,
      'label': 'data(name)',
      'text-valign': 'top',
      'text-halign': 'center',
      'font-size': '11px',
      'font-weight': '600',
      'color': '#283593',
      'text-margin-y': 7,
      'text-wrap': 'wrap',
      'text-max-width': '200px',
      'z-index': 2,
    }
  },
  {
    selector: 'node[type="capability"][level=2]',
    style: {
      'shape': 'rectangle',
      'background-color': 'data(maturityColor)',
      'border-color': '#888',
      'border-width': 1,
      'label': 'data(name)',
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': '10px',
      'font-weight': '500',
      'color': '#111',
      'text-wrap': 'wrap',
      'text-max-width': '140px',
      'z-index': 3,
    }
  },
  {
    selector: 'node[type="capability"][level=3]',
    style: {
      'shape': 'rectangle',
      'background-color': 'data(maturityColor)',
      'border-color': '#aaa',
      'border-width': 1,
      'label': 'data(name)',
      'text-valign': 'center',
      'font-size': '9px',
      'text-wrap': 'wrap',
      'text-max-width': '120px',
      'z-index': 4,
    }
  },
  {
    selector: 'node:selected[type="capability"]',
    style: {
      'border-color': '#0050b3',
      'border-width': 3,
    }
  },
  {
    selector: '.highlighted',
    style: {
      'border-color': '#faad14',
      'border-width': 3,
    }
  },
  {
    selector: '.dimmed',
    style: {
      'opacity': 0.3,
    }
  },
];

// 集成架构图样式（Integration Landscape）
export const integrationStyles = [
  {
    selector: 'node[type="application"]',
    style: {
      'shape': 'roundrectangle',
      'background-color': '#e6f7ff',
      'border-color': '#1890ff',
      'border-width': 2,
      'width': 90,
      'height': 56,
      'label': 'data(name)',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 8,
      'font-size': '11px',
      'font-weight': '600',
      'color': '#262626',
      'text-wrap': 'wrap',
      'text-max-width': '100px',
    }
  },
  {
    selector: 'node[type="technology"]',
    style: {
      'shape': 'diamond',
      'background-color': '#f6ffed',
      'border-color': '#52c41a',
      'border-width': 2,
      'width': 60,
      'height': 60,
      'label': 'data(name)',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 8,
      'font-size': '10px',
      'color': '#262626',
      'text-wrap': 'wrap',
      'text-max-width': '90px',
    }
  },
  // 按协议着色边
  { selector: 'edge[protocol="REST"]',   style: { 'line-color': '#1890ff', 'target-arrow-color': '#1890ff', 'source-arrow-color': '#1890ff' } },
  { selector: 'edge[protocol="SOAP"]',   style: { 'line-color': '#722ed1', 'target-arrow-color': '#722ed1', 'source-arrow-color': '#722ed1' } },
  { selector: 'edge[protocol="MQ"]',     style: { 'line-color': '#fa8c16', 'target-arrow-color': '#fa8c16', 'source-arrow-color': '#fa8c16' } },
  { selector: 'edge[protocol="DB"]',     style: { 'line-color': '#13c2c2', 'target-arrow-color': '#13c2c2', 'source-arrow-color': '#13c2c2' } },
  { selector: 'edge[protocol="FILE"]',   style: { 'line-color': '#8c8c8c', 'target-arrow-color': '#8c8c8c', 'line-style': 'dashed' } },
  { selector: 'edge[protocol="EDI"]',    style: { 'line-color': '#52c41a', 'target-arrow-color': '#52c41a', 'source-arrow-color': '#52c41a' } },
  { selector: 'edge[protocol="CUSTOM"]', style: { 'line-color': '#eb2f96', 'target-arrow-color': '#eb2f96', 'source-arrow-color': '#eb2f96' } },
  {
    selector: 'edge[type="integration"]',
    style: {
      'width': 2,
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'label': 'data(description)',
      'font-size': '9px',
      'color': '#595959',
      'text-background-color': '#fff',
      'text-background-opacity': 0.85,
      'text-background-padding': '2px',
      'edge-text-rotation': 'autorotate',
      'text-max-width': '120px',
      'text-wrap': 'wrap',
    }
  },
  {
    selector: 'edge[direction="bi"]',
    style: {
      'source-arrow-shape': 'triangle',
    }
  },
  {
    selector: 'node:selected',
    style: { 'border-color': '#0050b3', 'border-width': 3 }
  },
  {
    selector: 'edge:selected',
    style: { 'width': 4 }
  },
  {
    selector: '.highlighted',
    style: { 'border-color': '#faad14', 'border-width': 3 }
  },
  {
    selector: '.dimmed',
    style: { 'opacity': 0.25 }
  },
];
