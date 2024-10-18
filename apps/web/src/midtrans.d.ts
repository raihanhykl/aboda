// src/midtrans.d.ts

interface Snap {
  pay: (token: string, options?: SnapOptions) => void;
}

interface SnapOptions {
  onSuccess: (result: any) => void;
  onPending: (result: any) => void;
  onError: (result: any) => void;
  onClose: () => void;
}

interface Window {
  snap: Snap;
}

declare global {
  interface Window {
    snap: Snap;
  }
}
export {};
