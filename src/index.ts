import { Chart } from 'chart.js';
import StreamingPlugin from './plugins/plugin.streaming';
import RealTimeScale from './scales/scale.realtime';

const registerables = [StreamingPlugin, RealTimeScale];

Chart.register(registerables);

// Export for TypeScript users
export { RealTimeScale, StreamingPlugin };
export default registerables;
