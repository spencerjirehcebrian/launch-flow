interface Window {
  api: {
    send: (channel: string, data: any) => void;
    receive: (channel: string, func: (...args: any[]) => void) => void;
    invoke: <T>(channel: string, data: any) => Promise<T>;
    removeAllListeners: (channel: string) => void;
  };
}
