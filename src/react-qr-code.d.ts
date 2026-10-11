import type QRCodeComponent from "react-qr-code";

declare module "react-qr-code" {
  /**
   * The CommonJS build also exports the component by name. Vite 8's CJS interop
   * resolves the default import to the whole module object, so import this.
   */
  export const QRCode: typeof QRCodeComponent;
}
