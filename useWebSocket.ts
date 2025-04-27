import { useState, useEffect, useRef, useCallback } from 'react';

interface UseWebSocketOptions {
  reconnectInterval?: number;
  reconnectAttempts?: number;
  pingInterval?: number; // Add ping interval option
}

/**
 * Custom hook for WebSocket connections with reconnection capability
 * and ping/pong to keep connection alive
 */
const useWebSocket = (
  path: string,
  onMessage: (data: any) => void,
  options: UseWebSocketOptions = {}
) => {
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const socket = useRef<WebSocket | null>(null);
  const reconnectCount = useRef<number>(0);
  const reconnectTimeout = useRef<number | null>(null);
  const pingIntervalId = useRef<number | null>(null);
  const lastPongTime = useRef<number>(Date.now());
  
  const { 
    reconnectInterval = 5000, 
    reconnectAttempts = 10,
    pingInterval = 10000 // 10 seconds between pings
  } = options;

  // Create connection string with right protocol based on page URL
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}${path}`;
  }, [path]);

  // Send a ping to keep the connection alive
  const sendPing = useCallback(() => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      try {
        // Simple ping message
        socket.current.send(JSON.stringify({ type: 'ping' }));
        
        // Check if we're getting pongs
        const now = Date.now();
        if (now - lastPongTime.current > pingInterval * 3) {
          console.warn('No WebSocket pong received for a while, reconnecting...');
          if (socket.current) {
            socket.current.close();
          }
        }
      } catch (error) {
        console.error('Error sending ping:', error);
      }
    }
  }, [pingInterval]);

  const startPingInterval = useCallback(() => {
    // Clear any existing interval
    if (pingIntervalId.current) {
      window.clearInterval(pingIntervalId.current);
    }
    
    // Start new interval
    pingIntervalId.current = window.setInterval(sendPing, pingInterval);
  }, [pingInterval, sendPing]);

  const clearPingInterval = useCallback(() => {
    if (pingIntervalId.current) {
      window.clearInterval(pingIntervalId.current);
      pingIntervalId.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    // Clean up any existing connection
    if (socket.current) {
      socket.current.close();
    }
    
    clearPingInterval();

    // Create new connection
    try {
      const wsUrl = getWebSocketUrl();
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      socket.current = ws;
      setReadyState(WebSocket.CONNECTING);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setReadyState(WebSocket.OPEN);
        reconnectCount.current = 0;
        lastPongTime.current = Date.now(); // Reset pong timer
        startPingInterval();
      };

      ws.onmessage = (event) => {
        try {
          // Update last pong time for any message received (assuming server is alive)
          lastPongTime.current = Date.now();
          
          const data = JSON.parse(event.data);
          
          // Handle pong message specifically
          if (data.type === 'pong') {
            return;
          }
          
          // Forward all other messages
          onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`WebSocket disconnected with code: ${event.code}, reason: ${event.reason}`);
        setReadyState(WebSocket.CLOSED);
        clearPingInterval();
        
        // Attempt to reconnect if not at max attempts
        if (reconnectCount.current < reconnectAttempts) {
          reconnectCount.current += 1;
          console.log(`Attempting to reconnect (${reconnectCount.current}/${reconnectAttempts})...`);
          
          if (reconnectTimeout.current) {
            window.clearTimeout(reconnectTimeout.current);
          }
          
          // Exponential backoff for reconnect
          const delay = Math.min(30000, reconnectInterval * Math.pow(1.5, reconnectCount.current - 1));
          console.log(`Will attempt reconnect in ${delay}ms`);
          
          reconnectTimeout.current = window.setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error('Maximum reconnection attempts reached');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      // Try to reconnect after a delay
      reconnectTimeout.current = window.setTimeout(() => {
        reconnectCount.current += 1;
        connect();
      }, reconnectInterval);
    }
  }, [getWebSocketUrl, onMessage, reconnectAttempts, reconnectInterval, clearPingInterval, startPingInterval]);

  // Connect on mount
  useEffect(() => {
    connect();
    
    // Cleanup on unmount
    return () => {
      if (socket.current) {
        socket.current.close();
      }
      
      clearPingInterval();
      
      if (reconnectTimeout.current) {
        window.clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
    };
  }, [connect, clearPingInterval]);

  // Function to send data through the WebSocket
  const sendMessage = useCallback((data: any) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      try {
        socket.current.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    }
    return false;
  }, []);

  return {
    readyState,
    sendMessage
  };
};

export default useWebSocket;
