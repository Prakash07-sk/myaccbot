export {};

declare global {
  interface Window {
    electronAPI: {
      platform: string;
      selectFile: () => Promise<string | null>;
      selectFolder: () => Promise<string | null>;
      saveFile: (data: any) => Promise<string | null>;
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
      getAppVersion: () => Promise<string>;
      onNewConversation: (callback: (event: any) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
