import { toast } from '@/hooks/use-toast';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export class ToastManager {
  static success(message: string, options?: ToastOptions) {
    toast({
      title: options?.title || "Success",
      description: message,
      variant: "success",
    });
  }

  static error(message: string, options?: ToastOptions) {
    toast({
      title: options?.title || "Error",
      description: message,
      variant: "destructive",
    });
  }

  static info(message: string, options?: ToastOptions) {
    toast({
      title: options?.title || "Info",
      description: message,
      variant: "info",
    });
  }

  static warning(message: string, options?: ToastOptions) {
    toast({
      title: options?.title || "Warning",
      description: message,
      variant: "warning",
    });
  }
}

// Convenience functions for easier usage
export const showSuccess = (message: string, options?: ToastOptions) => {
  ToastManager.success(message, options);
};

export const showError = (message: string, options?: ToastOptions) => {
  ToastManager.error(message, options);
};

export const showInfo = (message: string, options?: ToastOptions) => {
  ToastManager.info(message, options);
};

export const showWarning = (message: string, options?: ToastOptions) => {
  ToastManager.warning(message, options);
};
