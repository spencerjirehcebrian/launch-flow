import { ipcService } from "../services";

// Re-export only the ipcService methods that might be needed directly
export const useIpc = () => {
  return {
    send: ipcService.send.bind(ipcService),
    invoke: ipcService.invoke.bind(ipcService),
    listen: ipcService.listen.bind(ipcService),
  };
};
