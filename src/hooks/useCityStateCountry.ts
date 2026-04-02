import {
  keepPreviousData,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { listCityStateCountry, listCity } from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";

interface GeoParams {
  country_id?: string;
  state_id?: string;
  search?: string;
  combobox?: boolean;
  limit?: number;
  offset?: number;
  include_id?: string;
  [key: string]: unknown;
}

interface LocationItem {
  id: string;
  name: string;
  state_id?: string;
  state_name?: string;
  country_id?: string;
  country_name?: string;
}

interface GeoResponse {
  items: LocationItem[];
  total: number;
  limit: number;
  offset: number;
}

export function useCityStateCountry(
  params: GeoParams,
  options?: Partial<UseQueryOptions<{ data: GeoResponse }, Error, GeoResponse>>,
) {
  return useQuery({
    queryKey: queryKeys.locations.list(params),
    queryFn: () => listCityStateCountry(params),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => data?.data,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useCountries(
  params: Omit<GeoParams, "country_id" | "state_id"> = { combobox: true },
  options?: Partial<UseQueryOptions<{ data: GeoResponse }, Error, GeoResponse>>,
) {
  return useQuery({
    queryKey: queryKeys.locations.list(params),
    queryFn: () => listCityStateCountry(params),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => data?.data,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useStates(
  countryId?: string,
  params: Omit<GeoParams, "country_id" | "state_id"> = { combobox: true },
  options?: Partial<UseQueryOptions<{ data: GeoResponse }, Error, GeoResponse>>,
) {
  return useQuery({
    queryKey: queryKeys.locations.list({ ...params, country_id: countryId }),
    queryFn: () => listCityStateCountry({ ...params, country_id: countryId }),
    enabled: (options?.enabled ?? true) && !!countryId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => data?.data,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useCities(
  stateId?: string,
  params: Omit<GeoParams, "country_id" | "state_id"> = { combobox: true },
  options?: Partial<UseQueryOptions<{ data: GeoResponse }, Error, GeoResponse>>,
) {
  return useQuery({
    queryKey: queryKeys.locations.list({ ...params, state_id: stateId }),
    queryFn: () => listCityStateCountry({ ...params, state_id: stateId }),
    enabled: (options?.enabled ?? true) && !!stateId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => data?.data,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useListCity(
  params: GeoParams,
  options?: Partial<UseQueryOptions<{ data: GeoResponse }, Error, GeoResponse>>,
) {
  return useQuery({
    queryKey: [...queryKeys.locations.all, "list-city", params],
    queryFn: () => listCity(params),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => data?.data,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });
}
