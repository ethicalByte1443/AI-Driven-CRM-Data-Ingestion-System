import { useEffect, useState, useRef, useCallback } from 'react';

export interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  shouldConnect?: boolean;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const { onMessage, onOpen, onClose, onError, shouldConnect = true } = options;
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  // Keep options callbacks stable so we don't trigger reconnects
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onOpenRef.current = onOpen;
    onCloseRef.current = onClose;
    onErrorRef.current = onError;
  });

  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.warn('[WS] Cannot send message: socket not connected');
    }
  }, []);

  useEffect(() => {
    if (!shouldConnect) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setConnected(false);
      return;
    }

    console.log(`[WS] Connecting to: ${url}`);
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = (event) => {
      setConnected(true);
      if (onOpenRef.current) onOpenRef.current(event);
    };

    socket.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        if (onMessageRef.current) onMessageRef.current(parsedData);
      } catch (err) {
        console.error('[WS] Failed to parse message event data:', err);
      }
    };

    socket.onerror = (event) => {
      console.error('[WS] WebSocket error:', event);
      if (onErrorRef.current) onErrorRef.current(event);
    };

    socket.onclose = (event) => {
      setConnected(false);
      if (onCloseRef.current) onCloseRef.current(event);
    };

    return () => {
      if (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      socketRef.current = null;
    };
  }, [url, shouldConnect]);

  return { connected, sendMessage };
}
export default useWebSocket;
