"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Shield,
  Truck,
  CreditCard,
  Sparkles,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/store/useCartStore"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import { apiClient } from "@/services/api"

export default function CartPage() {
  const router = useRouter()
  const { isAuthorized, isLoading: authLoading } = useRequireAuth()
  const { items, fetchCart, removeItem, updateQuantity, isLoading } = useCartStore()
  const [promoCode, setPromoCode] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Fetch cart on mount - MUST be before early returns
  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // Show loading state while checking auth
  if (authLoading) {
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

  const subtotal = items.reduce((sum, item) => sum + item.poster.price * item.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = subtotal * 0.18
  const total = subtotal + shipping + tax

  const handleCheckout = async () => {
    if (!selectedPayment) return

    setIsCheckingOut(true)
    try {
      const order = await apiClient.createOrder(
        items.map(item => ({
          poster_id: item.poster.id,
          quantity: item.quantity,
        }))
      )

      const payment = await apiClient.initiatePayment(order.id, selectedPayment)
      
      // Simulate payment completion
      await apiClient.completePayment(payment.payment_id, `TXN-${Date.now()}`)
      
      router.push("/success")
    } catch (error) {
      console.error("Checkout failed:", error)
      alert("Checkout failed. Please try again.")
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Your Cart</h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"} in your cart
            </p>
          </motion.div>

          {isLoading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Loading cart...</p>
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven&apos;t added any posters yet
              </p>
              <Link href="/collection">
                <Button className="glow-orange">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Browse Collection
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.poster_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass rounded-xl p-4 sm:p-6"
                  >
                    <div className="flex gap-4 sm:gap-6">
                      {/* Poster Preview */}
                      <div
                        className="w-24 h-32 sm:w-32 sm:h-40 rounded-lg flex-shrink-0 bg-gradient-to-br from-secondary to-secondary/50"
                        style={{
                          backgroundImage: `url(${item.poster.image_url})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-foreground">{item.poster.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.poster.category?.name || 'Uncategorized'}</p>
                            <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.poster.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(item.poster.id, item.quantity - 1)
                                } else {
                                  removeItem(item.poster.id)
                                }
                              }}
                              className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-secondary transition-colors"
                              disabled={isCheckingOut}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.poster.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-secondary transition-colors"
                              disabled={isCheckingOut}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              ${(item.poster.price * item.quantity).toFixed(2)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-muted-foreground">
                                ${item.poster.price.toFixed(2)} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass rounded-xl p-6 sticky top-24"
                >
                  <h2 className="text-lg font-semibold text-foreground mb-6">Order Summary</h2>

                  {/* Promo Code */}
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="bg-input border-border"
                        disabled={isCheckingOut}
                      />
                      <Button variant="secondary" className="glass" disabled={isCheckingOut}>
                        Apply
                      </Button>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (18%)</span>
                      <span className="text-foreground">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">
                        {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    {shipping === 0 && (
                      <p className="text-xs text-primary">Free shipping on orders over $100!</p>
                    )}
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-foreground mb-3">Payment Method</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "upi", label: "UPI", icon: "₹" },
                        { id: "gpay", label: "Google Pay", icon: "G" },
                        { id: "phonepe", label: "PhonePe", icon: "P" },
                        { id: "card", label: "Card", icon: <CreditCard className="h-4 w-4" /> },
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedPayment(method.id)}
                          disabled={isCheckingOut}
                          className={`p-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${
                            selectedPayment === method.id
                              ? "bg-primary/20 border border-primary/50 text-foreground"
                              : "glass glass-hover text-muted-foreground"
                          }`}
                        >
                          <span className="font-bold">{typeof method.icon === "string" ? method.icon : method.icon}</span>
                          <span>{method.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    className="w-full glow-orange py-6"
                    disabled={!selectedPayment || isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <>
                        <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <Shield className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-xs text-muted-foreground">Secure Payment</p>
                      </div>
                      <div>
                        <Truck className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-xs text-muted-foreground">Fast Delivery</p>
                      </div>
                      <div>
                        <Sparkles className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-xs text-muted-foreground">Premium Quality</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
