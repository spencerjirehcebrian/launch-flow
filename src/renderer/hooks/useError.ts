import { useState, useCallback } from "react";
import { useIpc } from "./useIpc";

/**
 * Hook for handling error messages from the main process
 */
export function useError() {
  const { useIpcListener } = useIpc();
  const [errors, setErrors] = useState<string[]>([]);

  // Add an error message
  const addError = useCallback((message: string) => {
    setErrors((prev) => [...prev, message]);
  }, []);

  // Clear all error messages
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Clear a specific error message
  const clearError = useCallback((index: number) => {
    setErrors((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Listen for error messages from the main process
  useIpcListener("error", (error: string) => {
    addError(error);
  });

  return {
    errors,
    addError,
    clearErrors,
    clearError,
  };
}
