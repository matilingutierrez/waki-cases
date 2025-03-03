export interface PhoneModel {
  id: string;
  name: string;
  caseImageUrl: string;
}

export interface PhoneColor {
  id: string;
  name: string;
  colorCode: string;
  displayName: string;
}

export interface Charm {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  width?: number;  // Optional width in pixels
  height?: number; // Optional height in pixels
} 