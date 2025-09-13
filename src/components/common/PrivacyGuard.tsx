import { ReactNode, useEffect } from 'react';
import { logger } from '@services/logger';

interface PrivacyGuardProps {
  children: ReactNode;
}

export function PrivacyGuard({ children }: PrivacyGuardProps) {
  useEffect(() => {
    // Enforce no network connections
    const originalFetch = window.fetch;
    window.fetch = () => {
      logger.warn('Network request blocked by PrivacyGuard');
      return Promise.reject(new Error('Network requests are disabled for privacy'));
    };

    // Block XMLHttpRequest
    const OriginalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = class extends OriginalXHR {
      override open() {
        logger.warn('XMLHttpRequest blocked by PrivacyGuard');
        throw new Error('Network requests are disabled for privacy');
      }
    } as typeof XMLHttpRequest;

    // Block WebSocket
    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = class extends OriginalWebSocket {
      constructor() {
        super('');
        logger.warn('WebSocket blocked by PrivacyGuard');
        throw new Error('WebSocket connections are disabled for privacy');
      }
    } as typeof WebSocket;

    // Log privacy protection status
    logger.privacy('Privacy Guard Active');
    logger.info('All network requests are blocked to ensure data privacy');

    // Cleanup on unmount (though app should never unmount this)
    return () => {
      window.fetch = originalFetch;
      window.XMLHttpRequest = OriginalXHR;
      window.WebSocket = OriginalWebSocket;
    };
  }, []);

  return <>{children}</>;
}