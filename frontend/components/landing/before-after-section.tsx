"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight } from "lucide-react"
import { HOME_PAGE_POSTERS } from "@/data/static-posters"

export function BeforeAfterSection() {
  const [sliderPosition, setSliderPosition] = useState(50)

  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Transformation</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
            See the Magic Happen
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch how AI transforms empty walls into stunning gallery displays
          </p>
        </motion.div>

        {/* Before/After Slider */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden glass"
        >
          <div className="aspect-video relative">
            {/* Before Image (Empty Wall) */}
            <div className="absolute inset-0 bg-secondary">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-full h-64 bg-muted/30 rounded-lg mb-4 flex items-center justify-center border-2 border-dashed border-border">
                    <span className="text-muted-foreground text-lg">Empty Wall</span>
                  </div>
                  <p className="text-muted-foreground">Before AI Magic</p>
                </div>
              </div>
            </div>

            {/* After Image (With Posters) */}
            <div
              className="absolute inset-0 bg-card overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8 w-full">
                  <div className="w-full h-64 bg-muted/10 rounded-lg mb-4 flex items-center justify-center gap-4 p-4 border border-primary/20">
                    {/* Display actual poster images */}
                    {HOME_PAGE_POSTERS.slice(0, 3).map((poster, idx) => (
                      <div key={poster.id} className="h-full aspect-[3/4] rounded-lg border border-primary/30 shadow-lg overflow-hidden">
                        <img
                          src={poster.image_url}
                          alt={poster.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-primary font-medium">After AI Design</p>
                </div>
              </div>
            </div>

            {/* Slider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize z-30"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center glow-orange">
                <ArrowRight className="h-4 w-4 text-primary-foreground rotate-180" />
                <ArrowRight className="h-4 w-4 text-primary-foreground -ml-1" />
              </div>
            </div>

            {/* Invisible slider input - must be on top */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40"
              style={{ pointerEvents: 'auto' }}
            />
          </div>

          {/* Labels */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full glass text-sm font-medium z-20">
            Before
          </div>
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium z-20">
            After
          </div>
        </motion.div>
      </div>
    </section>
  )
}
