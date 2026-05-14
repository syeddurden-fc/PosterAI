"use client"

import { motion } from "framer-motion"
import { 
  Sparkles, 
  Wand2, 
  Eye, 
  Palette, 
  Move3D, 
  Layers, 
  Zap,
  Image as ImageIcon 
} from "lucide-react"

const features = [
  {
    icon: Eye,
    title: "Wall Detection",
    description: "AI automatically detects wall boundaries and optimal placement zones in your room photos.",
  },
  {
    icon: Palette,
    title: "Color Matching",
    description: "Smart color analysis suggests posters that complement your room's existing palette.",
  },
  {
    icon: Wand2,
    title: "Auto Arrangement",
    description: "Generate multiple layout options with perfect spacing and visual balance.",
  },
  {
    icon: Move3D,
    title: "Realistic Shadows",
    description: "See how your posters will actually look with accurate lighting and shadow effects.",
  },
  {
    icon: Layers,
    title: "Style Presets",
    description: "Choose from curated layout styles: minimal, cinematic, gallery, and more.",
  },
  {
    icon: ImageIcon,
    title: "HD Previews",
    description: "Export high-resolution mockups of your designed wall for reference.",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Get AI-designed layouts in seconds, not minutes. Powered by cutting-edge models.",
  },
  {
    icon: Sparkles,
    title: "Smart Suggestions",
    description: "AI recommends poster combinations based on your style preferences and room aesthetics.",
  },
]

export function FeaturesSection() {
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
            <span className="text-sm font-medium">Powered by AI</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
            AI Features That Amaze
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our cutting-edge AI technology transforms the way you design your walls
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group glass glass-hover rounded-2xl p-6 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
