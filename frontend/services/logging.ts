/**
 * Logging service for tracking user actions and AI operations
 */

interface LogEvent {
  timestamp: string
  event: string
  data: Record<string, any>
}

class LoggingService {
  private logs: LogEvent[] = []

  async logAIGenerationStarted(
    sessionId: number,
    posterIds: number[],
    preset: string
  ) {
    const event: LogEvent = {
      timestamp: new Date().toISOString(),
      event: 'ai_generation_started',
      data: {
        sessionId,
        posterIds,
        preset,
      },
    }
    this.logs.push(event)
    console.log('[AI Generation Started]', event.data)
  }

  async logAIGenerationCompleted(
    sessionId: number,
    layoutId: number,
    duration: number,
    wallColor: string,
    dimensions: any,
    preset: string
  ) {
    const event: LogEvent = {
      timestamp: new Date().toISOString(),
      event: 'ai_generation_completed',
      data: {
        sessionId,
        layoutId,
        duration,
        wallColor,
        dimensions,
        preset,
      },
    }
    this.logs.push(event)
    console.log('[AI Generation Completed]', event.data)
  }

  async logAIGenerationFailed(
    sessionId: number,
    errorType: string,
    message: string,
    duration: number
  ) {
    const event: LogEvent = {
      timestamp: new Date().toISOString(),
      event: 'ai_generation_failed',
      data: {
        sessionId,
        errorType,
        message,
        duration,
      },
    }
    this.logs.push(event)
    console.error('[AI Generation Failed]', event.data)
  }

  async logPosterAdded(posterId: number, quantity: number) {
    const event: LogEvent = {
      timestamp: new Date().toISOString(),
      event: 'poster_added_to_cart',
      data: {
        posterId,
        quantity,
      },
    }
    this.logs.push(event)
    console.log('[Poster Added]', event.data)
  }

  async logOrderCreated(orderId: number, totalAmount: number, itemCount: number) {
    const event: LogEvent = {
      timestamp: new Date().toISOString(),
      event: 'order_created',
      data: {
        orderId,
        totalAmount,
        itemCount,
      },
    }
    this.logs.push(event)
    console.log('[Order Created]', event.data)
  }

  getLogs(): LogEvent[] {
    return this.logs
  }

  clearLogs() {
    this.logs = []
  }
}

export const loggingService = new LoggingService()
