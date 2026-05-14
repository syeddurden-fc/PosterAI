"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, SlidersHorizontal, X, Sparkles } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PosterCard } from "@/components/poster-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearchPosters, useCategories } from "@/hooks/usePosters"
import { useCartStore } from "@/store/useCartStore"
import { useRequireAuth } from "@/hooks/useRequireAuth"

export default function CollectionPage() {
  const router = useRouter()
  const { isAuthorized, isLoading } = useRequireAuth()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const { data: posters = [], isLoading: postersLoading } = useSearchPosters({
    search: searchQuery || undefined,
    category: selectedCategory,
    limit: 50,
  })
  
  const { addItem } = useCartStore()

  const handleAddToCart = async (posterId: number) => {
    try {
      console.log("Collection: Adding poster to cart:", posterId)
      await addItem(posterId, 1)
      console.log("Collection: Successfully added to cart, current items:", useCartStore.getState().items)
    } catch (error) {
      console.error("Collection: Failed to add to cart:", error)
      throw error
    }
  }

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

  const categoryOptions = [
    { label: "All", value: undefined },
    ...categories.map(cat => ({ label: cat.name, value: cat.slug }))
  ]

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Curated Collection</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
              Poster Collection
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our AI-curated selection of premium posters. Find the perfect piece for your wall.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search posters, artists, or styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 bg-input border-border text-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="secondary"
              className="glass glass-hover py-6 px-6"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters
            </Button>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categoryOptions.map((category) => (
              <button
                key={category.value || "all"}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.value
                    ? "bg-primary text-primary-foreground glow-orange"
                    : "glass glass-hover text-foreground"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-6">
            Showing {posters.length} {posters.length === 1 ? "poster" : "posters"}
          </p>
        </div>
      </section>

      {/* Poster Grid */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {postersLoading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Loading posters...</p>
            </div>
          ) : (
            <div className="masonry-grid">
              {posters.map((poster) => (
                <PosterCard
                  key={poster.id}
                  poster={{
                    id: poster.id,
                    title: poster.title,
                    artist: "Artist",
                    price: poster.price,
                    imageUrl: poster.image_url,
                    category: poster.category?.name || "Uncategorized",
                    aspectRatio: "portrait",
                    color: "#ff6b6b",
                  }}
                  onAddToCart={handleAddToCart}
                  onViewDetails={() => console.log("View details:", poster.id)}
                />
              ))}
            </div>
          )}

          {!postersLoading && posters.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">No posters found</p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory(undefined)
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
