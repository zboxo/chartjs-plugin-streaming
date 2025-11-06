import { Scale } from 'chart.js';
import {
  callback as call,
  each,
  noop,
  requestAnimFrame,
  valueOrDefault
} from 'chart.js/helpers';

export function clamp(value: number, lower: number, upper: number): number {
  return Math.min(Math.max(value, lower), upper);
}

export function resolveOption(scale: Scale, key: string): any {
  const realtimeOpts = (scale.options as any).realtime;
  const streamingOpts = scale.chart.options.plugins?.streaming;
  return valueOrDefault(realtimeOpts?.[key], (streamingOpts as any)?.[key]);
}

interface AxisMap {
  [key: string]: { axisId: string };
}

export function getAxisMap(
  element: any,
  { x, y }: { x: string[]; y: string[] },
  { xAxisID, yAxisID }: { xAxisID: string; yAxisID: string }
): AxisMap {
  const axisMap: AxisMap = {};

  each(x, (key: string) => {
    axisMap[key] = { axisId: xAxisID };
  });
  each(y, (key: string) => {
    axisMap[key] = { axisId: yAxisID };
  });
  return axisMap;
}

/**
 * Cancel animation polyfill
 */
const cancelAnimFrame = (function () {
  if (typeof window === 'undefined') {
    return noop;
  }
  return window.cancelAnimationFrame;
})();

interface TimerContext {
  frameRequestID?: number;
  nextRefresh?: number;
  refreshTimerID?: number;
  refreshInterval?: number;
}

export function startFrameRefreshTimer(
  context: TimerContext,
  func: () => number
): void {
  if (!context.frameRequestID) {
    const refresh = () => {
      const nextRefresh = context.nextRefresh || 0;
      const now = Date.now();

      if (nextRefresh <= now) {
        const newFrameRate = call(func, [], context) as number;
        const frameDuration = 1000 / (Math.max(newFrameRate, 0) || 30);
        const newNextRefresh = (context.nextRefresh || 0) + frameDuration || 0;

        context.nextRefresh =
          newNextRefresh > now ? newNextRefresh : now + frameDuration;
      }
      context.frameRequestID = requestAnimFrame.call(window, refresh);
    };
    context.frameRequestID = requestAnimFrame.call(window, refresh);
  }
}

export function stopFrameRefreshTimer(context: TimerContext): void {
  const frameRequestID = context.frameRequestID;

  if (frameRequestID) {
    cancelAnimFrame.call(window, frameRequestID);
    delete context.frameRequestID;
  }
}

export function stopDataRefreshTimer(context: TimerContext): void {
  const refreshTimerID = context.refreshTimerID;

  if (refreshTimerID) {
    clearInterval(refreshTimerID);
    delete context.refreshTimerID;
    delete context.refreshInterval;
  }
}

export function startDataRefreshTimer(
  context: TimerContext,
  func: () => number,
  interval?: number
): void {
  if (!context.refreshTimerID) {
    context.refreshTimerID = setInterval(() => {
      const newInterval = call(func, [], context) as number;

      if (context.refreshInterval !== newInterval && !isNaN(newInterval)) {
        stopDataRefreshTimer(context);
        startDataRefreshTimer(context, func, newInterval);
      }
    }, interval || 0);
    context.refreshInterval = interval || 0;
  }
}
