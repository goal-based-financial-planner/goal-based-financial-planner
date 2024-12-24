declare module 'react-progressbar-semicircle' {
  const SemiCircleProgressBar: React.ComponentType<{
    percentage: number;
    stroke?: string;
    strokeWidth?: number;
    background?: string;
    diameter?: number;
    showPercentValue?: boolean;
    style?: React.CSSProperties;
  }>;
  export default SemiCircleProgressBar;
}
