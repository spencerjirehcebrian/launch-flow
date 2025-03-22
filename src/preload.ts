// src/preload.ts
import { contextBridge, ipcRenderer } from "electron";

const validSendChannels = [
  "toMain",
  "runFlow",
  "stopCommand",
  "selectDirectory",
  "saveConfig",
  "loadConfig",
  "error", // ADD THIS
];

const validReceiveChannels = [
  "fromMain",
  "commandOutput",
  "commandStatus",
  "directorySelected",
  "configUpdated",
  "error", // AND THIS
];

contextBridge.exposeInMainWorld("api", {
  send: (channel: string, data: any): void => {
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel: string, func: (...args: any[]) => void): void => {
    if (validReceiveChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => func(...args));
    }
  },
  invoke: async (channel: string, data: any): Promise<any> => {
    if (validSendChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, data);
    }
    return null;
  },
  removeAllListeners: (channel: string): void => {
    if (validReceiveChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  },
});
