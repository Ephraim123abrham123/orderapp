"use client";

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { WS_BASE_URL } from "@/lib/constants";
import { useAuth } from "./useAuth";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

interface WebSocketContextType {
  status: ConnectionStatus;
  subscribe: (event: string, callback: (data: any) => void) => () => void;
  send: (data: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

/**
 * Provides WebSocket connectivity state and event subscriptions.
 * Initiates connections only when a valid JWT token is verified.
 */
export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const { token } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Record<string, Set<(data: any) => void>>>({});
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.CONNECTING || socketRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    if (socketRef.current) {
      socketRef.current.close();
    }

    setStatus("connecting");
    const ws = new WebSocket(WS_BASE_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection established");
      setStatus("connected");
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { event: eventName, data } = message;
        if (eventName && listenersRef.current[eventName]) {
          listenersRef.current[eventName].forEach((callback) => callback(data));
        }
      } catch (e) {
        // Safe check for string heartbeats
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connect();
        }, 5000);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket connection encountered an error:", error);
      ws.close();
    };
  };

  useEffect(() => {
    if (!token) {
      setStatus("disconnected");
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    connect();
    
    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send("ping");
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [token]);

  const subscribe = (event: string, callback: (data: any) => void) => {
    if (!listenersRef.current[event]) {
      listenersRef.current[event] = new Set();
    }
    listenersRef.current[event].add(callback);
    
    return () => {
      if (listenersRef.current[event]) {
        listenersRef.current[event].delete(callback);
      }
    };
  };

  const send = (data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  };

  return (
    <WebSocketContext.Provider value={{ status, subscribe, send }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
