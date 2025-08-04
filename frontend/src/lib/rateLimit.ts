import { NextRequest, NextResponse } from "next/server"

// Simple in-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string // Custom key generator
}

export function createRateLimit(config: RateLimitConfig) {
  return function rateLimit(req: NextRequest) {
    const key = config.keyGenerator ? config.keyGenerator(req) : getClientIP(req)
    const now = Date.now()

    // Get current rate limit data
    const current = rateLimitStore.get(key)

    if (!current || now > current.resetTime) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return null // Allow request
    }

    if (current.count >= config.maxRequests) {
      // Rate limit exceeded
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    // Increment count
    current.count++
    rateLimitStore.set(key, current)
    return null // Allow request
  }
}

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")
  const realIP = req.headers.get("x-real-ip")
  const cfConnectingIP = req.headers.get("cf-connecting-ip")

  return forwarded || realIP || cfConnectingIP || "unknown"
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

// Predefined rate limit configurations
export const rateLimits = {
  // General API rate limit
  api: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyGenerator: (req) => `api:${getClientIP(req)}`
  }),

  // Shortlink redirect rate limit (more strict)
  redirect: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    keyGenerator: (req) => `redirect:${getClientIP(req)}`
  }),

  // Authentication rate limit
  auth: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (req) => `auth:${getClientIP(req)}`
  }),

  // Shortlink creation rate limit
  create: createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyGenerator: (req) => `create:${getClientIP(req)}`
  })
}
