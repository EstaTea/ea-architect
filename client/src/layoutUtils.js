// 能力地图网格布局算法
// 不使用 dagre（在 compound nodes 下位置计算不准），手动递归计算网格坐标

const GRID = {
  L0_PADDING_H: 30,
  L0_PADDING_V: 40,
  L1_PADDING_H: 16,
  L1_PADDING_V: 32,
  L2_CELL_W: 160,
  L2_CELL_H: 72,
  GAP: 10,
  L0_GAP: 30,
  L1_GAP: 12,
  LABEL_H: 24,
};

const MAX_COLS = 4;

/**
 * 递归计算节点（含所有子孙）需要占用的宽高
 */
function calcSize(nodeId, childrenMap) {
  const children = childrenMap[nodeId] || [];
  if (children.length === 0) {
    return { w: GRID.L2_CELL_W, h: GRID.L2_CELL_H };
  }

  const level = children[0].level;
  const isL1Container = level === 2; // L1 节点包含 L2 子节点

  const cols = Math.min(children.length, MAX_COLS);
  const rows = Math.ceil(children.length / cols);
  const childSizes = children.map(c => calcSize(c.id, childrenMap));
  const colW = Math.max(...childSizes.map(s => s.w));
  const rowH = Math.max(...childSizes.map(s => s.h));

  const pH = isL1Container ? GRID.L1_PADDING_H : GRID.L0_PADDING_H;
  const pV = isL1Container ? GRID.L1_PADDING_V : GRID.L0_PADDING_V;

  return {
    w: cols * colW + (cols - 1) * GRID.GAP + pH * 2,
    h: rows * rowH + (rows - 1) * GRID.GAP + pV + GRID.LABEL_H + GRID.L1_PADDING_H,
  };
}

/**
 * 递归分配节点及所有子孙的绝对坐标（左上角原点）
 */
function assignPos(node, childrenMap, x, y, positions) {
  const size = calcSize(node.id, childrenMap);
  positions.set(node.id, { x, y, w: size.w, h: size.h });

  const children = childrenMap[node.id] || [];
  if (children.length === 0) return;

  const isL1Container = children[0].level === 2;
  const pH = isL1Container ? GRID.L1_PADDING_H : GRID.L0_PADDING_H;
  const pV = isL1Container ? GRID.L1_PADDING_V : GRID.L0_PADDING_V;

  const cols = Math.min(children.length, MAX_COLS);
  const childSizes = children.map(c => calcSize(c.id, childrenMap));
  const colW = Math.max(...childSizes.map(s => s.w));
  const rowH = Math.max(...childSizes.map(s => s.h));

  // 确定 L1 节点的排列：L0 内 L1 按行排列，每行最多 3 个
  if (!isL1Container) {
    // L0 → L1 排列
    const l1Cols = Math.min(children.length, 3);
    const l1Rows = Math.ceil(children.length / l1Cols);
    const l1ColW = Math.max(...childSizes.map(s => s.w));
    const l1RowH = Math.max(...childSizes.map(s => s.h));

    children.forEach((child, i) => {
      const col = i % l1Cols;
      const row = Math.floor(i / l1Cols);
      assignPos(
        child, childrenMap,
        x + pH + col * (l1ColW + GRID.L1_GAP),
        y + GRID.LABEL_H + pV + row * (l1RowH + GRID.L1_GAP),
        positions
      );
    });
  } else {
    // L1 → L2 排列
    children.forEach((child, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      assignPos(
        child, childrenMap,
        x + pH + col * (colW + GRID.GAP),
        y + GRID.LABEL_H + pV + row * (rowH + GRID.GAP),
        positions
      );
    });
  }
}

/**
 * 主入口：计算所有 capability 节点的位置和尺寸
 * 返回 Map<id, { position: {x, y}, width, height }>
 * position 使用 Cytoscape 中心点坐标
 */
export function computeCapabilityLayout(nodes) {
  const capNodes = nodes.filter(n => n.type === 'capability');

  // 建立父子映射
  const childrenMap = {};
  capNodes.forEach(n => {
    childrenMap[n.id] = capNodes.filter(c => c.parent === n.id);
  });

  // L0 根节点（无父节点）
  const roots = capNodes.filter(n => !n.parent);

  const positions = new Map();
  let curX = 60;

  roots.forEach(root => {
    assignPos(root, childrenMap, curX, 60, positions);
    const size = calcSize(root.id, childrenMap);
    curX += size.w + GRID.L0_GAP;
  });

  // 转为 Cytoscape 格式（中心点坐标）
  const result = {};
  positions.forEach((pos, id) => {
    result[id] = {
      position: { x: pos.x + pos.w / 2, y: pos.y + pos.h / 2 },
      width: pos.w,
      height: pos.h,
    };
  });
  return result;
}
