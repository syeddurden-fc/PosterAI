"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/services/api"
import { HOME_PAGE_POSTERS } from "@/data/static-posters"

// Default layout styles (fallback if API fails)
const defaultLayoutStyles = [
  {
    id: "minimal-grid",
    name: "Minimal Grid",
    description: "Clean, symmetrical arrangement for modern spaces",
    arrangement: "grid-2x2",
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Bold, movie-inspired poster displays",
    arrangement: "asymmetric",
  },
  {
    id: "gallery-wall",
    name: "Gallery Wall",
    description: "Professional gallery-style arrangement",
    arrangement: "gallery",
  },
  {
    id: "luxury-symmetry",
    name: "Luxury Symmetry",
    description: "Elegant, balanced arrangements",
    arrangement: "symmetric",
  },
  {
    id: "pinterest-style",
    name: "Pinterest Style",
    description: "Trendy, curated gallery walls",
    arrangement: "masonry",
  },
]

export function LayoutShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [layoutStyles, setLayoutStyles] = useState(defaultLayoutStyles)
  const [isLoading, setIsLoading] = useState(true)
  const [posters] = useState(HOME_PAGE_POSTERS)

  // Fetch layout presets from backend
  useEffect(() => {
    const fetchLayoutPresets = async () => {
      try {
        setIsLoading(true)
        // Try to fetch from backend - if it fails, use defaults
        const response = await apiClient.publicRequest('/ai/layout-presets', {
          method: 'GET',
        }).catch(() => null)
        
        if (response && Array.isArray(response)) {
          setLayoutStyles(response)
        } else {
          setLayoutStyles(defaultLayoutStyles)
        }
      } catch (err) {
        console.error("Failed to fetch layout presets:", err)
        setLayoutStyles(defaultLayoutStyles)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLayoutPresets()
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % layoutStyles.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + layoutStyles.length) % layoutStyles.length)
  }

  return (
    <section className="py-24 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Layout Presets</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Trending Wall Styles
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from AI-curated arrangement styles or let our algorithm design a unique layout for you
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative w-full py-8">
          <div className="overflow-visible">
            <motion.div
              className="flex"
              animate={{ x: `-${currentIndex * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {layoutStyles.map((style, index) => (
                <div key={style.id} className="w-full flex-shrink-0 px-4">
                  <div className="glass rounded-2xl p-8 max-w-5xl mx-auto">
                    {/* Layout Preview - Larger */}
                    <div className="aspect-video bg-muted/30 rounded-xl mb-6 p-8 flex items-center justify-center">
                      <LayoutPreview arrangement={style.arrangement} posters={posters} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-foreground mb-2">{style.name}</h3>
                      <p className="text-muted-foreground">{style.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Navigation Buttons - Positioned outside carousel */}
          <Button
            variant="secondary"
            size="icon"
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 glass glass-hover z-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 glass glass-hover z-10"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {layoutStyles.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-primary w-8"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function LayoutPreview({ arrangement, posters }: { arrangement: string; posters: any[] }) {
  const baseClasses = "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-lg shadow-lg overflow-hidden"
  
  // Helper to render poster image or fallback
  const PosterImage = ({ index, className }: { index: number; className: string }) => {
    const poster = posters[index % Math.max(posters.length, 1)]
    return (
      <div className={`${baseClasses} ${className}`}>
        {poster?.image_url ? (
          <img
            src={poster.image_url}
            alt={poster.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
      </div>
    )
  }
  
  switch (arrangement) {
    case "grid-2x2":
      return (
        <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
          <PosterImage index={0} className="aspect-[3/4]" />
          <PosterImage index={1} className="aspect-[3/4]" />
          <PosterImage index={2} className="aspect-[3/4]" />
          <PosterImage index={3} className="aspect-[3/4]" />
        </div>
      )
    case "asymmetric":
      return (
        <div className="flex gap-6 w-full max-w-2xl items-stretch">
          <PosterImage index={0} className="w-2/5 aspect-[2/3]" />
          <div className="flex flex-col gap-6 w-3/5">
            <PosterImage index={1} className="flex-1 aspect-video" />
            <PosterImage index={2} className="flex-1 aspect-video" />
          </div>
        </div>
      )
    case "gallery":
      return (
        <div className="flex flex-col gap-6 w-full max-w-2xl">
          <div className="flex gap-6">
            <PosterImage index={0} className="w-1/3 aspect-[3/4]" />
            <PosterImage index={1} className="w-2/3 aspect-[4/3]" />
          </div>
          <div className="flex gap-6">
            <PosterImage index={2} className="w-2/5 aspect-[3/4]" />
            <PosterImage index={3} className="w-3/5 aspect-square" />
          </div>
        </div>
      )
    case "symmetric":
      return (
        <div className="flex gap-8 items-center w-full max-w-2xl justify-center">
          <PosterImage index={0} className="w-24 aspect-[3/4]" />
          <PosterImage index={1} className="w-32 aspect-[3/4]" />
          <PosterImage index={2} className="w-24 aspect-[3/4]" />
        </div>
      )
    case "masonry":
      return (
        <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
          <PosterImage index={0} className="aspect-[3/4]" />
          <PosterImage index={1} className="aspect-square" />
          <PosterImage index={2} className="aspect-[3/5]" />
          <PosterImage index={3} className="aspect-square" />
          <PosterImage index={4} className="aspect-[3/4]" />
          <PosterImage index={5} className="aspect-square" />
        </div>
      )
    default:
      return null
  }
}
