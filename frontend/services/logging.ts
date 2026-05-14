/**
 * Frontend logging service
 * Sends events to backend for structured logging
 */

import { apiClient } from './api'

export interface LogEventPayload {
  event_type: string
  user_id?: number
  session_id?: number
  layout_id?: number
  duration_ms?: number
  status?: 'success' | 'failed'
  metadata?: Record<string, any>
  message?: string
}

class LoggingService {
  /**
   * Log an event to the backend
   */
  async logEvent(payload: LogEventPayload): Promise<void> {
    try {
      await apiClient.request('/ai/log-event', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch (error) {
      // Silently fail - don't break the app if logging fails
      console.error('Failed to log event:', error)
    }
  }

  /**
   * Log AI generation started
   */
  async logAIGenerationStarted(
    sessionId: number,
    posterIds: number[],
    layoutPreset: string,
    userId?: number
  ): Promise<void> {
    await this.logEvent({
      event_type: 'ai_generation_started',
      user_id: userId,
      session_id: sessionId,
      metadata: {
        poster_ids: posterIds,
        layout_preset: layoutPreset,
        poster_count: posterIds.length,
      },
      message: `AI layout generation started for session ${sessionId}`,
    })
  }

  /**
   * Log AI generation completed
   */
  async logAIGenerationCompleted(
    sessionId: number,
    layoutId: number,
    durationMs: number,
    wallColor: string,
    wallDimensions: { width: number; height: number },
    layoutPreset: string,
    userId?: number
  ): Promise<void> {
    await this.logEvent({
      event_type: 'ai_generation_completed',
      user_id: userId,
      session_id: sessionId,
      layout_id: layoutId,
      duration_ms: durationMs,
      status: 'success',
      metadata: {
        wall_color: wallColor,
        wall_dimensions: wallDimensions,
        layout_preset: layoutPreset,
      },
      message: `AI layout ${layoutId} generated in ${durationMs}ms`,
    })
  }

  /**
   * Log AI generation failed
   */
  async logAIGenerationFailed(
    sessionId: number,
    errorType: string,
    errorMessage: string,
    durationMs?: number,
    userId?: number
  ): Promise<void> {
    await this.logEvent({
      event_type: 'ai_generation_failed',
      user_id: userId,
      session_id: sessionId,
      duration_ms: durationMs,
      status: 'failed',
      metadata: {
        error_type: errorType,
        error_message: errorMessage,
      },
      message: `AI layout generation failed: ${errorMessage}`,
    })
  }

  /**
   * Log preview rendering started
   */
  async logPreviewRenderingStarted(
    sessionId: number,
    layoutId: number,
    userId?: number
  ): Promise<void> {
    await this.logEvent({
      event_type: 'preview_rendering_started',
      user_id: userId,
      session_id: sessionId,
      layout_id: layoutId,
      message: `Preview rendering started for layout ${layoutId}`,
    })
  }

  /**
   * Log preview rendering completed
   */
  async logPreviewRenderingCompleted(
    sessionId: number,
    layoutId: number,
    durationMs: number,
    previewPath: string,
    userId?: number
  ): Promise<void> {
    await this.logEvent({
      event_type: 'preview_rendering_completed',
      user_id: userId,
      session_id: sessionId,
      layout_id: layoutId,
      duration_ms: durationMs,
      status: 'success',
      metadata: {
        preview_path: previewPath,
      },
      message: `Preview rendered in ${durationMs}ms`,
    })
  }

  /**
   * Log wall detection
   */
  async logWallDetection(
    sessionId: number,
    wallColor: string,
    wallDimensions: { width: number; height: number },
    durationMs: number,
    userId?: number
  ): Promise<void> {
    await this.logEvent({
      event_type: 'wall_detection_completed',
      user_id: userId,
      session_id: sessionId,
      duration_ms: durationMs,
      metadata: {
        wall_color: wallColor,
        wall_dimensions: wallDimensions,
      },
      message: `Wall detected: ${wallColor}`,
    })
  }
}

export const loggingService = new LoggingService()
