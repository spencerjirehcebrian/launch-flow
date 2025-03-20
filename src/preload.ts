import { contextBridge, ipcRenderer } from "electron";

// Define valid channels for security
const validSendChannels = [
  "toMain",
  "runFlow",
  "stopCommand",
  "selectDirectory",
  "saveConfig",
  "loadConfig",
];

const validReceiveChannels = [
  "fromMain",
  "commandOutput",
  "commandStatus",
  "directorySelected",
  "configUpdated",
  "error",
];

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  send: (channel: string, data: any): void => {
    // whitelist channels
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel: string, func: (...args: any[]) => void): void => {
    if (validReceiveChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (_event, ...args) => func(...args));
    }
  },
  // Add invoke method for synchronous calls that need a response
  invoke: async (channel: string, data: any): Promise<any> => {
    if (validSendChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, data);
    }
    return null;
  },
  // Method to remove listeners when they're no longer needed
  removeAllListeners: (channel: string): void => {
    if (validReceiveChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  },
});
