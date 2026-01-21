declare module "@kichiyaki/react-native-barcode-generator" {
  import { ComponentType } from "react";
  import { ViewStyle } from "react-native";

  export interface BarcodeProps {
    value: string;
    format?:
      | "CODE39"
      | "CODE128"
      | "CODE128A"
      | "CODE128B"
      | "CODE128C"
      | "EAN13"
      | "EAN8"
      | "EAN5"
      | "EAN2"
      | "UPC"
      | "UPCE"
      | "ITF14"
      | "ITF"
      | "MSI"
      | "MSI10"
      | "MSI11"
      | "MSI1010"
      | "MSI1110"
      | "pharmacode"
      | "codabar"
      | "GenericBarcode";
    width?: number;
    height?: number;
    displayValue?: boolean;
    text?: string;
    fontOptions?: string;
    font?: string;
    textAlign?: "left" | "center" | "right";
    textPosition?: "bottom" | "top";
    textMargin?: number;
    fontSize?: number;
    background?: string;
    lineColor?: string;
    margin?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    flat?: boolean;
    style?: ViewStyle;
    onError?: (error: Error) => void;
  }

  const Barcode: ComponentType<BarcodeProps>;
  export default Barcode;
}
