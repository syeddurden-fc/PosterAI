"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Interior Designer",
    content: "WallCraft AI has completely changed how I present poster layouts to clients. The realistic mockups save hours of work.",
    rating: 5,
    avatar: "SC",
  },
  {
    name: "Marcus Johnson",
    role: "Anime Collector",
    content: "Finally, a tool that understands how to arrange anime posters! The collage layouts are perfect for my collection.",
    rating: 5,
    avatar: "MJ",
  },
  {
    name: "Emily Rodriguez",
    role: "Home Decorator",
    content: "I was skeptical about AI design, but the results blew me away. My living room wall has never looked better.",
    rating: 5,
    avatar: "ER",
  },
  {
    name: "David Park",
    role: "Gaming Streamer",
    content: "Used WallCraft to design my streaming room background. The gaming setup preset is exactly what I needed.",
    rating: 5,
    avatar: "DP",
  },
  {
    name: "Lisa Thompson",
    role: "Art Enthusiast",
    content: "The color matching feature is incredible. Every poster suggestion perfectly complements my room's aesthetic.",
    rating: 5,
    avatar: "LT",
  },
  {
    name: "Alex Kim",
    role: "Photographer",
    content: "As someone who sells prints, this tool helps my customers visualize exactly how art will look in their homes.",
    rating: 5,
    avatar: "AK",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-secondary/30 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Loved by Creators
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of designers, collectors, and decorators who trust WallCraft AI
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              
              <p className="text-foreground mb-6">{testimonial.content}</p>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
