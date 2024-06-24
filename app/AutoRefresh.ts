'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router'; // Assuming you meant `next/router` for routing in Next.js

interface AutoRefreshProps {
  children: React.ReactNode;
}

function AutoRefresh({ children }: AutoRefreshProps) {
  return children;
}

if (process.env.NODE_ENV === 'development') {
  const AutoRefresh: React.FC<AutoRefreshProps> = ({ children }) => {
    const router = useRouter();

    useEffect(() => {
      const ws = new WebSocket('ws://localhost:3001');
      ws.onmessage = (event) => {
        if (event.data === 'refresh') {
          router.reload();
        }
      };
      return () => {
        ws.close();
      };
    }, [router]);

    return children;
  };
}

export default AutoRefresh;
