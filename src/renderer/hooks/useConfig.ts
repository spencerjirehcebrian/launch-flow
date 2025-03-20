import { useState, useEffect, useCallback } from 'react';
import { DeploymentConfig, Environment, Flow } from '../../types';
import { useIpc } from './useIpc';

/**
 * Hook for managing application configuration
 */
export function useConfig() {
  const { invoke, useIpcListener } = useIpc();
  const [config, setConfig] = useState<DeploymentConfig>({
    rootDirectory: '',
    selectedEnvironments: ['dev'],
    selectedFlows: [],
  });
  const [loading, setLoading] = useState(true);

  // Load configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const loadedConfig = await invoke<DeploymentConfig>('loadConfig', null);
        setConfig(loadedConfig);
      } catch (error) {
        console.error('Error loading configuration:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [invoke]);

  // Save configuration
  const saveConfig = useCallback(async (newConfig: DeploymentConfig) => {
    try {
      await invoke('saveConfig', newConfig);
      setConfig(newConfig);
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  }, [invoke]);

  // Update root directory
  const selectRootDirectory = useCallback(async () => {
    try {
      const directory = await invoke<string | null>('selectDirectory', null);
      if (directory) {
        const updatedConfig = { ...config, rootDirectory: directory };
        await saveConfig(updatedConfig);
        return directory;
      }
      return null;
    } catch (error) {
      console.error('Error selecting directory:', error);
      return null;
    }
  }, [config, invoke, saveConfig]);

  // Update selected environments
  const updateSelectedEnvironments = useCallback(async (environments: Environment[]) => {
    try {
      const updatedConfig = { ...config, selectedEnvironments: environments };
      await saveConfig(updatedConfig);
    } catch (error) {
      console.error('Error updating environments:', error);
    }
  }, [config, saveConfig]);

  // Update selected flows
  const updateSelectedFlows = useCallback(async (flows: Flow[]) => {
    try {
      const updatedConfig = { ...config, selectedFlows: flows };
      await saveConfig(updatedConfig);
    } catch (error) {
      console.error('Error updating flows:', error);
    }
  }, [config, saveConfig]);

  // Listen for configuration updates from the main process
  useIpcListener('configUpdated', (updatedConfig: DeploymentConfig) => {
    setConfig(updatedConfig);
  });

  return {
    config,
    loading,
    selectRootDirectory,
    updateSelectedEnvironments,
    updateSelectedFlows,
    saveConfig,
  };
}