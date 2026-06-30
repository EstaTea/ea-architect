import { create } from 'zustand';
import { fetchArchitecture, saveArchitecture } from './api.js';

const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  positions: {},               // 集成图节点位置 { [nodeId]: {x, y} }
  sha: null,
  currentView: 'capability',
  selectedId: null,
  selectedType: null,
  searchQuery: '',
  loading: true,
  modalState: null,

  loadData: async () => {
    set({ loading: true });
    try {
      const data = await fetchArchitecture();
      set({
        nodes: data.nodes || [],
        edges: data.edges || [],
        positions: data.positions || {},
        sha: data.sha || null,
        loading: false,
      });
    } catch (e) {
      console.error('Load failed:', e);
      set({ loading: false });
    }
  },

  persist: async () => {
    const { nodes, edges, sha, positions } = get();
    try {
      const result = await saveArchitecture(nodes, edges, sha, positions);
      if (result.sha) set({ sha: result.sha });
    } catch (e) {
      console.error('Save failed:', e);
    }
  },

  // 更新节点位置（拖拽或布局完成后调用）
  savePositions: (newPositions) => {
    set(state => ({ positions: { ...state.positions, ...newPositions } }));
    get().persist();
  },

  upsertNode: (node) => {
    set(state => {
      const exists = state.nodes.find(n => n.id === node.id);
      const nodes = exists
        ? state.nodes.map(n => n.id === node.id ? node : n)
        : [...state.nodes, node];
      return { nodes };
    });
    get().persist();
  },

  deleteNode: (id) => {
    set(state => {
      const positions = { ...state.positions };
      delete positions[id];
      return {
        nodes: state.nodes.filter(n => n.id !== id),
        edges: state.edges.filter(e => e.source !== id && e.target !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
        selectedType: state.selectedId === id ? null : state.selectedType,
        positions,
      };
    });
    get().persist();
  },

  upsertEdge: (edge) => {
    set(state => {
      const exists = state.edges.find(e => e.id === edge.id);
      const edges = exists
        ? state.edges.map(e => e.id === edge.id ? edge : e)
        : [...state.edges, edge];
      return { edges };
    });
    get().persist();
  },

  deleteEdge: (id) => {
    set(state => ({
      edges: state.edges.filter(e => e.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      selectedType: state.selectedId === id ? null : state.selectedType,
    }));
    get().persist();
  },

  setSelected: (id, type) => set({ selectedId: id, selectedType: type }),
  setCurrentView: (view) => set({ currentView: view, selectedId: null, selectedType: null }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  openModal: (modalState) => set({ modalState }),
  closeModal: () => set({ modalState: null }),

  exportJSON: () => {
    const { nodes, edges, positions } = get();
    const blob = new Blob([JSON.stringify({ nodes, edges, positions }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}));

export default useStore;
