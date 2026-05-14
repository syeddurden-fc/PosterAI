/**
 * AI Workspace store using Zustand
 */
import { create } from 'zustand'

interface Poster {
  id: number
  title: string
  price: number
  imageUrl: string
}

interface WorkspacePoster {
  id: string
  poster: Poster
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

interface Session {
  id: number
  wallColor?: string
  layoutStyle?: string
  status?: string
}

interface Layout {
  id: number
  layout_type?: string
  layout_metadata_json?: any
  generated_preview_path?: string
}

interface WorkspaceStore {
  wallImage: string | null
  placedPosters: WorkspacePoster[]
  selectedPosterId: string | null
  activePreset: string | null
  sessionId: number | null
  layoutId: number | null
  previewPath: string | null
  session: Session | null
  layouts: Layout[]
  setWallImage: (image: string) => void
  addPoster: (poster: Poster, x: number, y: number, width: number, height: number) => void
  updatePosterPosition: (id: string, x: number, y: number) => void
  updatePosterSize: (id: string, width: number, height: number) => void
  removePoster: (id: string) => void
  selectPoster: (id: string | null) => void
  setActivePreset: (preset: string) => void
  setSession: (session: Session) => void
  setLayout: (layoutId: number) => void
  setPreview: (path: string) => void
  setLayouts: (layouts: Layout[]) => void
  clearWorkspace: () => void
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  wallImage: null,
  placedPosters: [],
  selectedPosterId: null,
  activePreset: null,
  sessionId: null,
  layoutId: null,
  previewPath: null,
  session: null,
  layouts: [],

  setWallImage: (image: string) => set({ wallImage: image }),

  addPoster: (poster: Poster, x: number, y: number, width: number, height: number) =>
    set((state) => ({
      placedPosters: [
        ...state.placedPosters,
        {
          id: `${poster.id}-${Date.now()}`,
          poster,
          x,
          y,
          width,
          height,
          rotation: 0,
        },
      ],
    })),

  updatePosterPosition: (id: string, x: number, y: number) =>
    set((state) => ({
      placedPosters: state.placedPosters.map((p) =>
        p.id === id ? { ...p, x, y } : p
      ),
    })),

  updatePosterSize: (id: string, width: number, height: number) =>
    set((state) => ({
      placedPosters: state.placedPosters.map((p) =>
        p.id === id ? { ...p, width, height } : p
      ),
    })),

  removePoster: (id: string) =>
    set((state) => ({
      placedPosters: state.placedPosters.filter((p) => p.id !== id),
    })),

  selectPoster: (id: string | null) => set({ selectedPosterId: id }),

  setActivePreset: (preset: string) => set({ activePreset: preset }),

  setSession: (session: Session) => set({ session, sessionId: session.id }),

  setLayout: (layoutId: number) => set({ layoutId }),

  setPreview: (path: string) => set({ previewPath: path }),

  setLayouts: (layouts: Layout[]) => set({ layouts }),

  clearWorkspace: () =>
    set({
      wallImage: null,
      placedPosters: [],
      selectedPosterId: null,
      activePreset: null,
      sessionId: null,
      layoutId: null,
      previewPath: null,
      session: null,
      layouts: [],
    }),
}))
