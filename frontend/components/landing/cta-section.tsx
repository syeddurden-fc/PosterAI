"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Start for Free</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Ready to Transform
            <br />
            <span className="text-primary text-glow-orange">Your Walls?</span>
          </h2>

          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Upload your first room photo and experience the magic of AI-powered wall design. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/workspace">
              <Button size="lg" className="glow-orange text-base px-8 py-6 animate-pulse-glow">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Creating Now
              </Button>
            </Link>
            <Link href="/collection">
              <Button size="lg" variant="secondary" className="text-base px-8 py-6 glass glass-hover">
                Browse Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Free tier includes 5 AI-generated layouts per month
          </p>
        </motion.div>
      </div>
    </section>
  )
}
