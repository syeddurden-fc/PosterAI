"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  CheckCircle,
  Download,
  FileImage,
  FileText,
  Share2,
  Home,
  ShoppingBag,
  Sparkles,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"

const purchasedItems = [
  { id: "1", title: "Neon Dreams", color: "#ff6b6b", quantity: 2 },
  { id: "2", title: "Cyber City", color: "#4ecdc4", quantity: 1 },
  { id: "3", title: "Mountain Mist", color: "#96ceb4", quantity: 1 },
]

export default function SuccessPage() {
  const [showConfetti, setShowConfetti] = useState(true)
  const [copied, setCopied] = useState(false)
  const orderId = "WC-2024-78432"

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <Navigation />

      {/* Animated confetti/celebration effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: ["#ff6b6b", "#4ecdc4", "#feca57", "#ff9ff3", "#54a0ff"][i % 5],
                left: `${Math.random() * 100}%`,
              }}
              initial={{ y: -20, opacity: 1 }}
              animate={{
                y: "100vh",
                opacity: 0,
                rotate: Math.random() * 720,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px]" />
      </div>

      <section className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/50"
                initial={{ scale: 0.8, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Payment Successful!
            </h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your order. Your posters are being prepared.
            </p>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-semibold text-foreground">{orderId}</p>
                  <button
                    onClick={handleCopy}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-primary">$125.00</p>
              </div>
            </div>

            {/* Purchased Items */}
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Items Purchased</h3>
              <div className="space-y-3">
                {purchasedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div
                      className="w-12 h-16 rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${item.color}40 0%, ${item.color}60 100%)`,
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* AI Room Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Your AI Room Preview</h3>
            </div>
            <div className="aspect-video bg-secondary/50 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
              {/* Simulated room preview */}
              <div className="absolute inset-4 bg-muted/30 rounded-lg border border-border/30 flex items-center justify-center gap-3 p-4">
                {purchasedItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-lg shadow-xl"
                    style={{
                      width: index === 1 ? "80px" : "60px",
                      height: index === 1 ? "100px" : "80px",
                      background: `linear-gradient(135deg, ${item.color}40 0%, ${item.color}60 100%)`,
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              This is how your posters will look when arranged on your wall
            </p>
          </motion.div>

          {/* Download Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
          >
            <Button variant="secondary" className="glass glass-hover py-6">
              <FileImage className="h-5 w-5 mr-2" />
              Download JPEG
            </Button>
            <Button variant="secondary" className="glass glass-hover py-6">
              <FileText className="h-5 w-5 mr-2" />
              Download PDF
            </Button>
          </motion.div>

          {/* Share Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Button variant="secondary" className="w-full glass glass-hover py-6">
              <Share2 className="h-5 w-5 mr-2" />
              Share Your Design
            </Button>
          </motion.div>

          {/* Navigation Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/" className="flex-1">
              <Button variant="secondary" className="w-full glass glass-hover py-6">
                <Home className="h-5 w-5 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/collection" className="flex-1">
              <Button className="w-full glow-orange py-6">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </motion.div>

          {/* Delivery Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Estimated delivery: <span className="text-foreground font-medium">3-5 business days</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              A confirmation email has been sent to your email address
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
