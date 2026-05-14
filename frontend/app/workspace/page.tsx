"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  Sparkles,
  RefreshCw,
  Download,
  Share2,
  Grid,
  Layers,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Plus,
  Minus,
  Check,
  X,
  ShoppingCart,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { apiClient, Poster, AILayout, AIRoomSession } from "@/services/api"
import { loggingService } from "@/services/logging"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { useCartStore } from "@/store/useCartStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useRequireAuth } from "@/hooks/useRequireAuth"

const layoutPresets = [
  { id: "minimal_grid", name: "Minimal Grid", icon: Grid },
  { id: "cinematic", name: "Cinematic", icon: Layers },
  { id: "anime_collage", name: "Anime Collage", icon: Layers },
  { id: "luxury_symmetry", name: "Luxury Symmetry", icon: Grid },
  { id: "floating_cluster", name: "Floating Cluster", icon: Layers },
  { id: "pinterest_style", name: "Pinterest Style", icon: Grid },
  { id: "gaming_setup", name: "Gaming Setup", icon: Layers },
  { id: "music_studio", name: "Music Studio", icon: Grid },
]

export default function WorkspacePage() {
  const { isAuthorized, isLoading } = useRequireAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [hasUploadedImage, setHasUploadedImage] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [generatedLayouts, setGeneratedLayouts] = useState<AILayout[]>([])
  const [activeLayout, setActiveLayout] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [selectedPosters, setSelectedPosters] = useState<Poster[]>([])
  const [recommendations, setRecommendations] = useState<Array<{ id: number; title: string; match: number }>>([])
  const [posterGap, setPosterGap] = useState(20)
  const [wallMargin, setWallMargin] = useState(40)
  const [zoom, setZoom] = useState(100)
  const [currentSession, setCurrentSession] = useState<AIRoomSession | null>(null)
  const [panX, setPanX] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [posterQuantities, setPosterQuantities] = useState<Record<number, number>>({})
  const { setSession, setLayouts } = useWorkspaceStore()
  const { addItem, getTotalCount } = useCartStore()
  const [cartCount, setCartCount] = useState(0)
  const [showPosterBrowser, setShowPosterBrowser] = useState(false)
  const [availablePosters, setAvailablePosters] = useState<Poster[]>([])

  // Fetch available posters and cart items on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available posters
        const posters = await apiClient.getPosters(0, 50)
        setAvailablePosters(posters || [])
        
        // Fetch cart items and pre-fill selected posters
        const cart = await apiClient.getCart()
        if (cart && cart.items && cart.items.length > 0) {
          // Convert cart items to poster objects with quantities
          const cartPosters = cart.items
            .filter(item => item.poster)
            .map(item => item.poster!)
          
          setSelectedPosters(cartPosters)
          
          // Set quantities from cart
          const quantities: Record<number, number> = {}
          cart.items.forEach(item => {
            quantities[item.poster_id] = item.quantity
          })
          setPosterQuantities(quantities)
        }
        
        // Generate recommendations based on available posters
        if (posters && posters.length > 0) {
          const recs = [
            { id: 1, title: "Minimal Grid", match: Math.floor(Math.random() * 20) + 85 },
            { id: 2, title: "Cinematic Layout", match: Math.floor(Math.random() * 20) + 75 },
            { id: 3, title: "Luxury Symmetry", match: Math.floor(Math.random() * 20) + 70 },
          ]
          setRecommendations(recs)
        }
      } catch (err) {
        console.error("Failed to fetch data:", err)
        // Set default recommendations even if fetch fails
        setRecommendations([
          { id: 1, title: "Minimal Grid", match: 85 },
          { id: 2, title: "Cinematic Layout", match: 75 },
          { id: 3, title: "Luxury Symmetry", match: 70 },
        ])
      }
    }
    fetchData()
  }, [])

  // Hydrate cart on mount
  useEffect(() => {
    const { hydrate } = useCartStore.getState()
    hydrate()
  }, [])

  // Update cart count when cart items change
  useEffect(() => {
    setCartCount(useCartStore.getState().getTotalCount())
  }, [selectedPosters])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    )
  }

  // Show nothing if not authorized (will redirect)
  if (!isAuthorized) {
    return null
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleAddPosterToCart = async (poster: Poster) => {
    try {
      const currentQty = posterQuantities[poster.id] || 0
      const newQty = currentQty + 1
      
      // Add to backend cart
      await addItem(poster.id, 1)
      
      // Update local quantity tracking
      setPosterQuantities(prev => ({
        ...prev,
        [poster.id]: newQty
      }))
      
      // Update cart count from store
      setCartCount(getTotalCount())
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart')
    }
  }

  const handleRemovePosterFromCart = async (posterId: number) => {
    try {
      const currentQty = posterQuantities[posterId] || 0
      if (currentQty > 0) {
        setPosterQuantities(prev => ({
          ...prev,
          [posterId]: currentQty - 1
        }))
        // Update cart count from store
        setCartCount(getTotalCount())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cart')
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const response = await apiClient.uploadRoom(file)
      
      // Store session data - backend returns AIRoomSession with 'id' field
      setCurrentSession(response)
      setSession({
        id: response.id,
        wallColor: response.wall_color,
        layoutStyle: response.layout_style,
        status: response.status,
      })

      // Create preview URL from uploaded image
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImageUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      setHasUploadedImage(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedPreset) {
      setError('Please select a layout preset')
      return
    }

    if (selectedPosters.length === 0) {
      setError('Please select at least one poster')
      return
    }

    setIsGenerating(true)
    setError(null)
    const startTime = Date.now()

    try {
      const session = useWorkspaceStore.getState().session
      if (!session?.id) {
        setError('No session found')
        return
      }

      // Get selected poster IDs
      const posterIds = selectedPosters.map(p => p.id)
      console.log("=== GENERATE LAYOUT ===")
      console.log("Session ID:", session.id)
      console.log("Poster IDs:", posterIds)
      console.log("Layout Preset:", selectedPreset)
      console.log("Selected Posters:", selectedPosters.map(p => ({ id: p.id, title: p.title })))

      // Log generation started
      await loggingService.logAIGenerationStarted(
        session.id,
        posterIds,
        selectedPreset
      )

      // Clear previous layouts before generating new one
      setGeneratedLayouts([])
      setActiveLayout(0)

      const response = await apiClient.generateLayout(
        session.id,
        posterIds,
        selectedPreset
      )

      console.log("=== LAYOUT RESPONSE ===")
      console.log("Response:", response)
      console.log("Layout Metadata JSON:", response.layout_metadata_json)

      // Parse and log the layout metadata
      try {
        const metadata = JSON.parse(response.layout_metadata_json)
        console.log("Parsed Metadata:", metadata)
        console.log("Placements:", metadata.placements)
      } catch (e) {
        console.error("Failed to parse layout metadata:", e)
      }

      // Store layout - IMPORTANT: Replace array, don't append
      const newLayouts = [response]
      setGeneratedLayouts(newLayouts)
      setLayouts(newLayouts)
      setActiveLayout(0)

      console.log("Updated generatedLayouts:", newLayouts)

      // Log generation completed
      const durationMs = Date.now() - startTime
      await loggingService.logAIGenerationCompleted(
        session.id,
        response.id,
        durationMs,
        currentSession?.wall_color || 'unknown',
        { width: 1920, height: 1080 },
        selectedPreset
      )
    } catch (err) {
      const durationMs = Date.now() - startTime
      const session = useWorkspaceStore.getState().session
      
      // Log generation failed
      if (session?.id) {
        await loggingService.logAIGenerationFailed(
          session.id,
          'generation_error',
          err instanceof Error ? err.message : 'Unknown error',
          durationMs
        )
      }
      
      setError(err instanceof Error ? err.message : 'Failed to generate layout')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = async () => {
    setIsGenerating(true)
    setError(null)
    const startTime = Date.now()

    try {
      const session = useWorkspaceStore.getState().session
      const layouts = useWorkspaceStore.getState().layouts
      
      if (!session?.id || !layouts[activeLayout]) {
        setError('No session or layout found')
        return
      }

      // Log generation started
      const posterIds = selectedPosters.map(p => p.id)
      await loggingService.logAIGenerationStarted(
        session.id,
        posterIds,
        selectedPreset || 'unknown'
      )

      const response = await apiClient.regenerateLayout(
        session.id,
        layouts[activeLayout].id
      )

      // Update layouts - IMPORTANT: Replace the specific layout, not append
      const updatedLayouts = [...layouts.slice(0, activeLayout), response as any, ...layouts.slice(activeLayout + 1)]
      setGeneratedLayouts(updatedLayouts as AILayout[])
      setLayouts(updatedLayouts)

      console.log("Updated layouts after regenerate:", updatedLayouts)

      // Log generation completed
      const durationMs = Date.now() - startTime
      await loggingService.logAIGenerationCompleted(
        session.id,
        response.id,
        durationMs,
        currentSession?.wall_color || 'unknown',
        { width: 1920, height: 1080 },
        selectedPreset || 'unknown'
      )
    } catch (err) {
      const durationMs = Date.now() - startTime
      const session = useWorkspaceStore.getState().session
      
      // Log generation failed
      if (session?.id) {
        await loggingService.logAIGenerationFailed(
          session.id,
          'regeneration_error',
          err instanceof Error ? err.message : 'Unknown error',
          durationMs
        )
      }
      
      setError(err instanceof Error ? err.message : 'Failed to regenerate layout')
    } finally {
      setIsGenerating(false)
    }
  }

  const renderLayoutArrangement = (layout: AILayout, posters: Poster[]) => {
    try {
      const metadata = JSON.parse(layout.layout_metadata_json)
      const placements = metadata.placements || []
      const wallWidth = metadata.wall_width || 1920
      const wallHeight = metadata.wall_height || 1080
      
      console.log("=== LAYOUT RENDERING DEBUG ===")
      console.log("Layout ID:", layout.id)
      console.log("Wall dimensions:", { wallWidth, wallHeight })
      console.log("Number of placements:", placements.length)
      console.log("Placements data:", JSON.stringify(placements, null, 2))
      console.log("Selected posters:", posters.map(p => ({ id: p.id, title: p.title })))
      console.log("Poster IDs in placements:", placements.map((p: any) => p.poster_id))
      console.log("Poster IDs in selected:", posters.map(p => p.id))
      
      return (
        <div className="relative w-full h-full bg-red-500/10">
          {placements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-red-500">No placements found in layout</p>
            </div>
          )}
          {placements.map((placement: any, index: number) => {
            const poster = posters.find(p => p.id === placement.poster_id)
            
            if (!poster) {
              console.warn(`Poster not found for placement poster_id=${placement.poster_id}`)
              console.warn(`Available poster IDs:`, posters.map(p => p.id))
              // Still render a placeholder so we can see the layout
              const leftPercent = (placement.x / wallWidth) * 100
              const topPercent = (placement.y / wallHeight) * 100
              const widthPercent = (placement.width / wallWidth) * 100
              const heightPercent = (placement.height / wallHeight) * 100
              
              return (
                <div
                  key={`placeholder-${index}`}
                  className="absolute bg-yellow-500/30 border-2 border-yellow-500 flex items-center justify-center text-yellow-700 text-xs font-bold"
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    width: `${widthPercent}%`,
                    height: `${heightPercent}%`,
                  }}
                >
                  Poster {placement.poster_id} not found
                </div>
              )
            }
            
            // Convert pixel coordinates to percentages
            const leftPercent = (placement.x / wallWidth) * 100
            const topPercent = (placement.y / wallHeight) * 100
            const widthPercent = (placement.width / wallWidth) * 100
            const heightPercent = (placement.height / wallHeight) * 100
            
            console.log(`Poster ${poster.id} (${poster.title}):`, {
              pixelCoords: { x: placement.x, y: placement.y, w: placement.width, h: placement.height },
              percentCoords: { left: leftPercent.toFixed(2), top: topPercent.toFixed(2), width: widthPercent.toFixed(2), height: heightPercent.toFixed(2) },
              rotation: placement.rotation
            })
            
            return (
              <motion.div
                key={`${placement.poster_id}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="absolute cursor-move group"
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  width: `${widthPercent}%`,
                  height: `${heightPercent}%`,
                  transform: `rotate(${placement.rotation}deg)`,
                  transformOrigin: 'center',
                }}
              >
                {poster.image_url ? (
                  <img
                    src={poster.image_url}
                    alt={poster.title}
                    className="w-full h-full rounded-lg shadow-2xl border border-white/10 object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-lg shadow-2xl border border-white/10"
                    style={{
                      background: `linear-gradient(135deg, #ff6b6b40 0%, #ff6b6b60 100%)`,
                    }}
                  />
                )}
                {/* Shadow effect */}
                <div className="absolute inset-0 rounded-lg shadow-[8px_8px_20px_rgba(0,0,0,0.5)]" />
                {/* Resize handles */}
                <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-se-resize" />
                <div className="absolute -left-1 -bottom-1 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-sw-resize" />
              </motion.div>
            )
          })}
        </div>
      )
    } catch (err) {
      console.error("Failed to render layout:", err)
      return <div className="text-red-500">Error rendering layout: {String(err)}</div>
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="pt-16 h-screen flex flex-col">
        {/* Top Toolbar */}
        <div className="h-14 border-b border-border glass flex items-center px-4 gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">AI Workspace</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-12 text-center">{zoom}%</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setZoom(Math.min(200, zoom + 10))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="glass">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="secondary" size="sm" className="glass">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button 
              size="sm" 
              className="glow-orange relative"
              onClick={() => {
                if (selectedPosters.length === 0) {
                  setError('Please select posters first')
                  return
                }
                // Add all selected posters to cart
                selectedPosters.forEach(poster => {
                  handleAddPosterToCart(poster)
                })
                setError('Added ' + selectedPosters.length + ' poster(s) to cart!')
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="px-6 py-3 bg-destructive/10 border-b border-destructive/20 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-destructive hover:text-destructive/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Room Preview */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="h-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                {!hasUploadedImage ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl"
                  >
                    {/* Upload Zone */}
                    <div
                      onClick={handleUploadClick}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.add('border-primary/50')
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('border-primary/50')
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('border-primary/50')
                        const file = e.dataTransfer.files?.[0]
                        if (file) {
                          const event = {
                            target: { files: [file] },
                          } as unknown as React.ChangeEvent<HTMLInputElement>
                          handleFileChange(event)
                        }
                      }}
                      className="aspect-video glass rounded-2xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-all flex flex-col items-center justify-center gap-4 p-8"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Upload className="h-10 w-10 text-primary" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          Upload Your Room Photo
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Drag and drop or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supports JPG, PNG, WEBP up to 10MB
                        </p>
                      </div>
                      <Button className="glow-orange" disabled={isUploading}>
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? 'Uploading...' : 'Choose File'}
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="canvas"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-4xl"
                  >
                    {/* Room Canvas */}
                    <div className="relative aspect-video glass rounded-2xl overflow-hidden">
                      {/* Uploaded room image or simulated room */}
                      {uploadedImageUrl ? (
                        <img
                          src={uploadedImageUrl}
                          alt="Room"
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-secondary/80" />
                      )}

                      {/* Wall area overlay - use full container */}
                      <div className="absolute inset-0 bg-muted/30 rounded-lg border border-border/30 overflow-hidden">
                        {/* AI-generated poster arrangements */}
                        {(() => {
                          console.log("Canvas render check:", { generatedLayoutsLength: generatedLayouts.length, activeLayout, condition: generatedLayouts.length > 0 && activeLayout < generatedLayouts.length })
                          if (generatedLayouts.length > 0 && activeLayout < generatedLayouts.length) {
                            console.log("Rendering layout arrangement")
                            return (
                              <div className="absolute inset-0">
                                {renderLayoutArrangement(generatedLayouts[activeLayout], selectedPosters)}
                              </div>
                            )
                          } else {
                            console.log("Rendering fallback grid layout")
                            return (
                              <div className="absolute inset-4 flex items-center justify-center gap-4">
                                {selectedPosters.map((poster, index) => (
                                  <motion.div
                                    key={poster.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative cursor-move group"
                                    style={{
                                      width: index === 1 ? "120px" : "100px",
                                      height: index === 1 ? "160px" : "140px",
                                    }}
                                  >
                                    {poster.image_url ? (
                                      <img
                                        src={poster.image_url}
                                        alt={poster.title}
                                        className="w-full h-full rounded-lg shadow-2xl border border-white/10 object-cover"
                                      />
                                    ) : (
                                      <div
                                        className="w-full h-full rounded-lg shadow-2xl border border-white/10"
                                        style={{
                                          background: `linear-gradient(135deg, #ff6b6b40 0%, #ff6b6b60 100%)`,
                                        }}
                                      />
                                    )}
                                    {/* Shadow effect */}
                                    <div className="absolute inset-0 rounded-lg shadow-[8px_8px_20px_rgba(0,0,0,0.5)]" />
                                    {/* Resize handles */}
                                    <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-se-resize" />
                                    <div className="absolute -left-1 -bottom-1 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-sw-resize" />
                                  </motion.div>
                                ))}
                              </div>
                            )
                          }
                        })()}

                        {/* Wall detection overlay when generating */}
                        {isGenerating && (
                          <div className="absolute inset-0 border-2 border-primary/50 rounded-lg animate-pulse">
                            <div className="absolute inset-0 bg-primary/5" />
                            <div className="absolute top-2 left-2 px-2 py-1 bg-primary/20 rounded text-xs text-primary">
                              AI Detecting Wall...
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Floor simulation */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-secondary to-transparent" />

                      {/* Controls overlay */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="glass"
                            onClick={() => {
                              setPanX(panX + 10)
                              setError("Pan: Move " + (panX + 10) + "px")
                            }}
                          >
                            <Move className="h-4 w-4 mr-1" />
                            Pan
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="glass"
                            onClick={() => {
                              setRotation((rotation + 15) % 360)
                              setError("Rotated " + ((rotation + 15) % 360) + "°")
                            }}
                          >
                            <RotateCw className="h-4 w-4 mr-1" />
                            Rotate
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          {generatedLayouts.length > 0 && (
                            <div className="flex items-center gap-1 glass rounded-lg p-1">
                              {generatedLayouts.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setActiveLayout(index)}
                                  className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-all ${
                                    activeLayout === index
                                      ? "bg-primary text-primary-foreground"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  {index + 1}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Generate Button */}
                    <div className="mt-6 flex justify-center">
                      <Button
                        size="lg"
                        className="glow-orange animate-pulse-glow"
                        onClick={generatedLayouts.length > 0 ? handleRegenerate : handleGenerate}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            Generating Layout...
                          </>
                        ) : generatedLayouts.length > 0 ? (
                          <>
                            <RefreshCw className="h-5 w-5 mr-2" />
                            Regenerate Layout
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Generate AI Layout
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Panel - Controls */}
          <div className="w-80 border-l border-border glass flex flex-col overflow-hidden">
            {/* Panel Header */}
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Controls
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Selected Posters */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Selected Posters ({selectedPosters.length})</h4>
                <div className="space-y-2">
                  {selectedPosters.map((poster) => {
                    const qty = posterQuantities[poster.id] || 0
                    return (
                      <div
                        key={poster.id}
                        className="flex items-center gap-3 p-2 rounded-lg glass"
                      >
                        {poster.image_url ? (
                          <img
                            src={poster.image_url}
                            alt={poster.title}
                            className="w-10 h-12 rounded object-cover"
                          />
                        ) : (
                          <div
                            className="w-10 h-12 rounded"
                            style={{
                              background: `linear-gradient(135deg, #ff6b6b40 0%, #ff6b6b60 100%)`,
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <span className="text-sm text-foreground block">{poster.title}</span>
                          <span className="text-xs text-muted-foreground">${poster.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {qty > 0 ? (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => handleRemovePosterFromCart(poster.id)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-xs font-medium w-4 text-center">{qty}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => handleAddPosterToCart(poster)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-xs"
                              onClick={() => handleAddPosterToCart(poster)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                        <button 
                          onClick={() => setSelectedPosters(selectedPosters.filter(p => p.id !== poster.id))}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  })}
                  {selectedPosters.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No posters selected</p>
                  )}
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full glass glass-hover"
                    onClick={() => setShowPosterBrowser(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add More Posters
                  </Button>
                </div>
              </div>

              {/* Layout Presets */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Layout Presets</h4>
                <div className="grid grid-cols-2 gap-2">
                  {layoutPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset.id)}
                      className={`p-3 rounded-lg text-left transition-all ${
                        selectedPreset === preset.id
                          ? "bg-primary/20 border border-primary/50"
                          : "glass glass-hover"
                      }`}
                    >
                      <preset.icon className="h-4 w-4 text-primary mb-1" />
                      <span className="text-xs text-foreground">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Suggestions */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  AI Recommendations
                </h4>
                <div className="space-y-2">
                  {recommendations.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => setSelectedPreset(suggestion.title.toLowerCase().replace(/\s+/g, '-'))}
                      className="w-full flex items-center justify-between p-3 rounded-lg glass glass-hover"
                    >
                      <span className="text-sm text-foreground">{suggestion.title}</span>
                      <span className="text-xs text-primary">{suggestion.match}% match</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Spacing Controls */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Spacing</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Poster Gap</span>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6"
                        onClick={() => setPosterGap(Math.max(0, posterGap - 5))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-8 text-center">{posterGap}px</span>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6"
                        onClick={() => setPosterGap(posterGap + 5)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Wall Margin</span>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6"
                        onClick={() => setWallMargin(Math.max(0, wallMargin - 5))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-8 text-center">{wallMargin}px</span>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6"
                        onClick={() => setWallMargin(wallMargin + 5)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="glass text-xs"
                    onClick={() => {
                      // Auto-align: distribute posters evenly
                      setError("Auto-align feature coming soon!")
                    }}
                  >
                    Auto-align
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="glass text-xs"
                    onClick={() => {
                      // Center all: move all posters to center
                      setError("Center all feature coming soon!")
                    }}
                  >
                    Center all
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="glass text-xs"
                    onClick={() => {
                      // Reset: clear all selections
                      setSelectedPosters([])
                      setSelectedPreset(null)
                      setError(null)
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-border space-y-2">
              <Button 
                className="w-full glow-orange"
                onClick={() => {
                  if (selectedPosters.length === 0) {
                    setError('Please select posters first')
                    return
                  }
                  setError('Added ' + selectedPosters.length + ' poster(s) to cart!')
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                Confirm & Add to Cart ({selectedPosters.length})
              </Button>
              <Button variant="secondary" className="w-full glass">
                Save Project
              </Button>
            </div>
          </div>
        </div>

        {/* Poster Browser Modal */}
        <AnimatePresence>
          {showPosterBrowser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowPosterBrowser(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-background rounded-2xl glass max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">Browse Posters</h2>
                  <button
                    onClick={() => setShowPosterBrowser(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availablePosters.map((poster) => {
                      const isSelected = selectedPosters.find(p => p.id === poster.id)
                      return (
                        <motion.div
                          key={poster.id}
                          whileHover={{ scale: 1.05 }}
                          className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${
                            isSelected ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedPosters(selectedPosters.filter(p => p.id !== poster.id))
                            } else {
                              setSelectedPosters([...selectedPosters, poster])
                            }
                          }}
                        >
                          {poster.image_url ? (
                            <img
                              src={poster.image_url}
                              alt={poster.title}
                              className="w-full aspect-[3/4] object-cover"
                            />
                          ) : (
                            <div
                              className="w-full aspect-[3/4]"
                              style={{
                                background: `linear-gradient(135deg, #ff6b6b40 0%, #ff6b6b60 100%)`,
                              }}
                            />
                          )}
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Check className="h-8 w-8 text-primary" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <p className="text-white text-sm font-medium truncate">{poster.title}</p>
                            <p className="text-white/70 text-xs">${poster.price.toFixed(2)}</p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-border flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {selectedPosters.length} poster(s) selected
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setShowPosterBrowser(false)}
                    >
                      Close
                    </Button>
                    <Button
                      className="glow-orange"
                      onClick={() => setShowPosterBrowser(false)}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
