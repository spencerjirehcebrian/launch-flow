import { useCallback, useEffect } from "react";

// Define a generic type for IPC communication
type IpcCallback<T = any> = (data: T) => void;

/**
 * Hook for IPC communication with the Electron main process
 */
export function useIpc() {
  // Send a message to the main process
  const send = useCallback((channel: string, data: any) => {
    window.api.send(channel, data);
  }, []);

  // Invoke a method in the main process and receive a response
  const invoke = useCallback(
    async <T>(channel: string, data: any): Promise<T> => {
      return await window.api.invoke<T>(channel, data);
    },
    []
  );

  // Set up a listener for messages from the main process
  const listen = useCallback(<T>(channel: string, callback: IpcCallback<T>) => {
    // Add listener
    window.api.receive(channel, callback);

    // Return cleanup function to remove listener when component unmounts
    return () => {
      window.api.removeAllListeners(channel);
    };
  }, []);

  // Helper to add a listener with useEffect
  const useIpcListener = <T>(channel: string, callback: IpcCallback<T>) => {
    useEffect(() => {
      // Set up the listener
      const cleanup = listen<T>(channel, callback);

      // Clean up on unmount
      return cleanup;
    }, [channel, callback]);
  };

  return {
    send,
    invoke,
    listen,
    useIpcListener,
  };
}
