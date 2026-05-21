export interface AddressInput {
  formatted_address: string;
  street: string;
  number: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
}

export interface Address extends AddressInput {
  id: string;
  is_selected: boolean;
}

export interface AddressSummary extends AddressInput {
  id: string;
}

export type AddressSearchResult = AddressInput;

export interface AddressListResponse {
  addresses: Address[];
}

export interface AddressSearchResponse {
  results: AddressSearchResult[];
}
