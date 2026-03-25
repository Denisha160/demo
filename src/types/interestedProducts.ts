import { ApiResponse } from "./products";

export interface InterestedProduct {
  id: string;
  product_name: string;
  code: string;
  selling_price: number | string;
}

export interface InterestedProductsResponse {
  interestedProducts: InterestedProduct[];
}

export type InterestedProductsApiResponse =
  ApiResponse<InterestedProductsResponse>;
