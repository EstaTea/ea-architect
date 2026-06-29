import { create } from 'zustand';
import { fetchArchitecture, saveArchitecture } from './api.js';

const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  sha: null,                   // GitHub 文件当前 SHA，写入时必须携带
  currentView: 'capability',   // 'capability' | 'integration'
  selectedId: null,
  selectedType: null,          // 'node' | 'edge'
  searchQuery: '',
  loading: true,
  modalState: null,            // null | { mode: 'add'|'edit', type: 'node'|'edge', data?: {} }

  loadData: async () => {
    set({ loading: true });
    try {
      const data = await fetchArchitecture();
      set({ nodes: data.nodes || [], edges: data.edges || [], sha: data.sha || null, loading: false });
    } catch (e) {
      console.error('Load failed:', e);
      set({ loading: false });
    }
  },

  persist: async () => {
    const { nodes, edges, sha } = get();
    try {
      const result = await saveArchitecture(nodes, edges, sha);
      if (result.sha) set({ sha: result.sha }); // 更新本地 SHA 缓存
    } catch (e) {
      console.error('Save failed:', e);
    }
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
    set(state => ({
      nodes: state.nodes.filter(n => n.id !== id),
      edges: state.edges.filter(e => e.source !== id && e.target !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      selectedType: state.selectedId === id ? null : state.selectedType,
    }));
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
    const { nodes, edges } = get();
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}));

export default useStore;
