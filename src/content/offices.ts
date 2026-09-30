import type { Office } from "./schemas";

export const offices: Office[] = [
  { country: "United States", countryCode: "US", address: "8 The Green STE A, Dover, DE 19901", phone: "+1 (307) 243-8623" },
  { country: "Albania", countryCode: "AL", address: "Uleza street, Tiranë 1001", phone: "+355 69 447 3606" },
  { country: "Pakistan", countryCode: "PK", address: "Lahore, Punjab 54000", phone: "+92 322 3676969" },
];

/** Map pin per office (city label and coordinates), keyed by country code. */
export const officeMarkers: Record<string, { label: string; lon: number; lat: number }> = {
  US: { label: "Dover", lon: -75.52, lat: 39.16 },
  AL: { label: "Tiranë", lon: 19.82, lat: 41.33 },
  PK: { label: "Lahore", lon: 74.36, lat: 31.52 },
};
