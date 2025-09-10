import { ReactNode, useEffect } from 'react';

interface PrivacyGuardProps {
  children: ReactNode;
}

export function PrivacyGuard({ children }: PrivacyGuardProps) {
  useEffect(() => {
    // Enforce no network connections
    const originalFetch = window.fetch;
    window.fetch = () => {
      console.error('Network request blocked by PrivacyGuard');
      return Promise.reject(new Error('Network requests are disabled for privacy'));
    };

    // Block XMLHttpRequest
    const OriginalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = class extends OriginalXHR {
      open() {
        console.error('XMLHttpRequest blocked by PrivacyGuard');
        throw new Error('Network requests are disabled for privacy');
      }
    } as any;

    // Block WebSocket
    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = class extends OriginalWebSocket {
      constructor() {
        console.error('WebSocket blocked by PrivacyGuard');
        throw new Error('WebSocket connections are disabled for privacy');
        super(''); // This won't be reached
      }
    } as any;

    // Log privacy protection status
    console.log('%c🔒 Privacy Guard Active', 'color: green; font-weight: bold');
    console.log('All network requests are blocked to ensure data privacy');

    // Cleanup on unmount (though app should never unmount this)
    return () => {
      window.fetch = originalFetch;
      window.XMLHttpRequest = OriginalXHR;
      window.WebSocket = OriginalWebSocket;
    };
  }, []);

  return <>{children}</>;
}