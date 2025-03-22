import { useState, useCallback } from "react";
import { useIpc } from "./useIpc";

interface ErrorInfo {
  message: string;
  timestamp: number;
  source?: string;
}

export function useError() {
  const { useIpcListener } = useIpc();
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const addError = useCallback((message: string, source?: string) => {
    const errorInfo: ErrorInfo = {
      message,
      timestamp: Date.now(),
      source,
    };
    console.error("Error:", errorInfo);
    setErrors((prev) => [...prev, errorInfo]);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearError = useCallback((index: number) => {
    setErrors((prev) => prev.filter((_, i) => i !== index));
  }, []);

  useIpcListener("error", (message: string) => {
    console.log("Received error from main:", message); // ADD THIS LINE
    addError(message, "Main Process");
  });

  return {
    errors,
    addError,
    clearErrors,
    clearError,
  };
}
