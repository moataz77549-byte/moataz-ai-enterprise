import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  /** Controls the off-canvas sidebar drawer on small screens (< md). Independent
   *  from `sidebarCollapsed`, which only applies to the desktop rail. */
  mobileSidebarOpen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;
  activeWorkspaceId: string;
  activeWorkspaceName: string;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setNotificationsPanelOpen: (open: boolean) => void;
  setActiveWorkspace: (id: string, name: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  commandPaletteOpen: false,
  notificationsPanelOpen: false,
  activeWorkspaceId: 'personal',
  activeWorkspaceName: 'Personal Workspace',

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
  setMobileSidebarOpen: (open: boolean) => set({ mobileSidebarOpen: open }),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  setCommandPaletteOpen: (open: boolean) => set({ commandPaletteOpen: open }),
  setNotificationsPanelOpen: (open: boolean) => set({ notificationsPanelOpen: open }),
  setActiveWorkspace: (id: string, name: string) => set({ activeWorkspaceId: id, activeWorkspaceName: name }),
}));
