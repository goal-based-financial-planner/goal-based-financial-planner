// Google Identity Services (loaded via CDN script in index.html)
declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenResponse {
        access_token: string;
        expires_in: string | number;
        token_type: string;
        scope: string;
        error?: string;
      }
      interface TokenClient {
        requestAccessToken(opts?: { prompt?: string }): void;
      }
      interface TokenClientConfig {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
      }
      function initTokenClient(config: TokenClientConfig): TokenClient;
    }
  }
}

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
