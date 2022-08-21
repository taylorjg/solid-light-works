import * as C from './constants'

export class CycleTiming {
  constructor(maxTicks, onReset) {
    this.cycleDurationMs = maxTicks * C.TICK_DURATION_MS
    this.onReset = onReset
    this.accumulatedDurationMs = 0
    this.firstTime = true
  }

  update(deltaMs, absoluteMs) {
    if (absoluteMs !== undefined) {
      this.accumulatedDurationMs = absoluteMs
    } else {
      this.accumulatedDurationMs += deltaMs
    }

    const cycleRatio = this.accumulatedDurationMs / this.cycleDurationMs
    const tick = this.accumulatedDurationMs / C.TICK_DURATION_MS

    if (this.accumulatedDurationMs > this.cycleDurationMs) {
      this.firstTime = false
      this.accumulatedDurationMs = 0
      this.onReset?.()
    }

    return { cycleRatio, tick, firstTime: this.firstTime }
  }
}
