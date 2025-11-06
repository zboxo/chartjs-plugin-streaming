import {registry, Scale, Chart} from 'chart.js';
import {isFinite} from 'chart.js/helpers';

interface ScaleValueResult {
  value: number;
  transitionable: boolean;
}

function scaleValue(scale: Scale, value: any, fallback: number): ScaleValueResult {
  value = typeof value === 'number' ? value : scale.parse(value);
  return isFinite(value) ?
    {value: scale.getPixelForValue(value), transitionable: true} :
    {value: fallback, transitionable: false};
}

interface StreamingData {
  [key: string]: { axisId: string; reverse?: boolean };
}

function updateBoxAnnotation(element: any, chart: Chart, options: any): void {
  const {scales, chartArea} = chart;
  const {xScaleID, yScaleID, xMin, xMax, yMin, yMax} = options;
  const xScale = scales[xScaleID];
  const yScale = scales[yScaleID];
  const {top, left, bottom, right} = chartArea;
  const streaming: StreamingData = element.$streaming = {};

  if (xScale) {
    const min = scaleValue(xScale, xMin, left);
    const max = scaleValue(xScale, xMax, right);
    const reverse = min.value > max.value;

    if (min.transitionable) {
      streaming[reverse ? 'x2' : 'x'] = {axisId: xScaleID};
    }
    if (max.transitionable) {
      streaming[reverse ? 'x' : 'x2'] = {axisId: xScaleID};
    }
    if (min.transitionable !== max.transitionable) {
      streaming.width = {axisId: xScaleID, reverse: min.transitionable};
    }
  }

  if (yScale) {
    const min = scaleValue(yScale, yMin, top);
    const max = scaleValue(yScale, yMax, bottom);
    const reverse = min.value > max.value;

    if (min.transitionable) {
      streaming[reverse ? 'y2' : 'y'] = {axisId: yScaleID};
    }
    if (max.transitionable) {
      streaming[reverse ? 'y' : 'y2'] = {axisId: yScaleID};
    }
    if (min.transitionable !== max.transitionable) {
      streaming.height = {axisId: yScaleID, reverse: min.transitionable};
    }
  }
}

interface ClipArea {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

function updateLineAnnotation(element: any, chart: Chart, options: any): ClipArea {
  const {scales, chartArea} = chart;
  const {scaleID, value} = options;
  const scale = scales[scaleID];
  const {top, left, bottom, right} = chartArea;
  const streaming: StreamingData = element.$streaming = {};

  if (scale) {
    const isHorizontal = scale.isHorizontal();
    const pixel = scaleValue(scale, value, 0);

    if (pixel.transitionable) {
      streaming[isHorizontal ? 'x' : 'y'] = {axisId: scaleID};
      streaming[isHorizontal ? 'x2' : 'y2'] = {axisId: scaleID};
    }
    return isHorizontal ? {top, bottom} : {left, right};
  }

  const {xScaleID, yScaleID, xMin, xMax, yMin, yMax} = options;
  const xScale = scales[xScaleID];
  const yScale = scales[yScaleID];
  const clip: ClipArea = {};

  if (xScale) {
    const min = scaleValue(xScale, xMin, left);
    const max = scaleValue(xScale, xMax, right);

    if (min.transitionable) {
      streaming.x = {axisId: xScaleID};
    } else {
      clip.left = left;
    }
    if (max.transitionable) {
      streaming.x2 = {axisId: xScaleID};
    } else {
      clip.right = right;
    }
  }

  if (yScale) {
    const min = scaleValue(yScale, yMin, top);
    const max = scaleValue(yScale, yMax, bottom);

    if (min.transitionable) {
      streaming.y = {axisId: yScaleID};
    } else {
      clip.top = top;
    }
    if (max.transitionable) {
      streaming.y2 = {axisId: yScaleID};
    } else {
      clip.bottom = bottom;
    }
  }

  return clip;
}

function updatePointAnnotation(element: any, chart: Chart, options: any): void {
  const scales = chart.scales;
  const {xScaleID, yScaleID, xValue, yValue} = options;
  const xScale = scales[xScaleID];
  const yScale = scales[yScaleID];
  const streaming: StreamingData = element.$streaming = {};

  if (xScale) {
    const x = scaleValue(xScale, xValue, 0);

    if (x.transitionable) {
      streaming.x = {axisId: xScaleID};
    }
  }

  if (yScale) {
    const y = scaleValue(yScale, yValue, 0);

    if (y.transitionable) {
      streaming.y = {axisId: yScaleID};
    }
  }
}

function initAnnotationPlugin(): void {
  const BoxAnnotation = registry.getElement('boxAnnotation');
  const LineAnnotation = registry.getElement('lineAnnotation');
  const PointAnnotation = registry.getElement('pointAnnotation');
  
  if (!BoxAnnotation || !LineAnnotation || !PointAnnotation) {
    return;
  }
  
  const resolveBoxAnnotationProperties = (BoxAnnotation as any).prototype.resolveElementProperties;
  const resolveLineAnnotationProperties = (LineAnnotation as any).prototype.resolveElementProperties;
  const resolvePointAnnotationProperties = (PointAnnotation as any).prototype.resolveElementProperties;

  (BoxAnnotation as any).prototype.resolveElementProperties = function(chart: Chart, options: any) {
    updateBoxAnnotation(this, chart, options);
    return resolveBoxAnnotationProperties.call(this, chart, options);
  };

  (LineAnnotation as any).prototype.resolveElementProperties = function(chart: Chart, options: any) {
    const chartArea = chart.chartArea;
    (chart as any).chartArea = updateLineAnnotation(this, chart, options);
    const properties = resolveLineAnnotationProperties.call(this, chart, options);
    (chart as any).chartArea = chartArea;
    return properties;
  };

  (PointAnnotation as any).prototype.resolveElementProperties = function(chart: Chart, options: any) {
    updatePointAnnotation(this, chart, options);
    return resolvePointAnnotationProperties.call(this, chart, options);
  };
}

export function attachChart(plugin: any, chart: Chart): void {
  const streaming = (chart as any).$streaming;

  if (streaming.annotationPlugin !== plugin) {
    const afterUpdate = plugin.afterUpdate;

    initAnnotationPlugin();
    streaming.annotationPlugin = plugin;
    plugin.afterUpdate = function(this: any, _chart: Chart, args: any, options: any) {
      const mode = args.mode;
      const animationOpts = options.animation;

      if (mode === 'quiet') {
        options.animation = false;
      }
      afterUpdate.call(this, _chart, args, options);
      if (mode === 'quiet') {
        options.animation = animationOpts;
      }
    };
  }
}

export function getElements(chart: Chart): any[] {
  const plugin = (chart as any).$streaming?.annotationPlugin;

  if (plugin) {
    return plugin.getAnnotations(chart);
  }
  return [];
}

export function detachChart(chart: Chart): void {
  delete (chart as any).$streaming.annotationPlugin;
}

