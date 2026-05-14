"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, ShoppingCart, Plus, Eye, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PosterCardProps {
  poster: {
    id: string | number
    title: string
    artist: string
    price: number
    category: string
    tags?: string[]
    aspectRatio?: "portrait" | "square" | "landscape"
    color?: string
    imageUrl?: string
  }
  onAddToCart?: (id: string | number) => Promise<void> | void
  onViewDetails?: (id: string | number) => void
}

export function PosterCard({ poster, onAddToCart, onViewDetails }: PosterCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [quantity, setQuantity] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const aspectClasses = {
    portrait: "aspect-[3/4]",
    square: "aspect-square",
    landscape: "aspect-[4/3]",
  }

  const handleAddClick = async () => {
    setIsLoading(true)
    try {
      console.log("Adding poster to cart:", poster.id)
      await onAddToCart?.(poster.id)
      console.log("Successfully added to cart")
      setQuantity(1)
    } catch (error) {
      console.error("Failed to add to cart:", error)
      setQuantity(0) // Reset on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleIncrement = async () => {
    setIsLoading(true)
    try {
      console.log("Incrementing poster quantity:", poster.id)
      await onAddToCart?.(poster.id)
      console.log("Successfully incremented")
      setQuantity(q => q + 1)
    } catch (error) {
      console.error("Failed to increment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecrement = () => {
    if (quantity > 0) {
      setQuantity(q => q - 1)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="masonry-item group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative glass rounded-xl overflow-hidden">
        {/* Poster Image */}
        <div
          className={`${aspectClasses[poster.aspectRatio || "portrait"]} relative`}
          style={{
            backgroundImage: poster.imageUrl ? `url(${poster.imageUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            background: !poster.imageUrl ? `linear-gradient(135deg, ${poster.color || "#ff6b6b"}20 0%, ${poster.color || "#ff6b6b"}40 50%, ${poster.color || "#ff6b6b"}20 100%)` : undefined,
          }}
        >
          {!poster.imageUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-3/4 border border-white/10 rounded-lg flex items-center justify-center">
                <span className="text-white/30 text-sm font-medium">{poster.category}</span>
              </div>
            </div>
          )}

          {/* Hover Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center gap-3"
          >
            <Button
              size="icon"
              variant="secondary"
              className="glass"
              onClick={() => onViewDetails?.(poster.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="glow-orange"
              onClick={handleAddClick}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Wishlist Button */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center transition-transform hover:scale-110"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${isLiked ? "fill-primary text-primary" : "text-foreground"
                }`}
            />
          </button>

          {/* Tags */}
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            {poster.tags?.length ? (
              poster.tags.slice(0, 2).map((tag, idx) => <span key={idx} className="text-xs bg-black/50 text-white px-2 py-1 rounded">{tag}</span>)
            ) : (
              <span className="text-gray-400 text-xs">No tags</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-medium text-foreground truncate">{poster.title}</h3>
          <p className="text-sm text-muted-foreground">{poster.artist}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-primary">${poster.price}</span>
            {quantity === 0 ? (
              <Button
                size="sm"
                variant="secondary"
                className="glass glass-hover"
                onClick={handleAddClick}
                disabled={isLoading}
              >
                <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                Add
              </Button>
            ) : (
              <div className="flex items-center gap-1 bg-primary/10 rounded-lg p-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={handleDecrement}
                  disabled={isLoading}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xs font-medium w-4 text-center">{quantity}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={handleIncrement}
                  disabled={isLoading}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
