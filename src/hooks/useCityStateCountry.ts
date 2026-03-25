import { useQuery } from "@tanstack/react-query";
import { listCityStateCountry, listCity } from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";

interface GeoParams {
  country_id?: string;
  state_id?: string;
  search?: string;
  combobox?: boolean;
  limit?: number;
  offset?: number;
  [key: string]: unknown;
}

export function useCityStateCountry(params: GeoParams, options?: any) {
  return useQuery({
    queryKey: queryKeys.locations.list(params),
    queryFn: () => listCityStateCountry(params),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data: any) => data?.data,
    ...options,
  });
}

export function useCountries(
  params: Omit<GeoParams, "country_id" | "state_id"> = { combobox: true },
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.locations.list(params),
    queryFn: () => listCityStateCountry(params),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data: any) => data?.data,
    ...options,
  });
}

export function useStates(
  countryId?: string,
  params: Omit<GeoParams, "country_id" | "state_id"> = { combobox: true },
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.locations.list({ ...params, country_id: countryId }),
    queryFn: () => listCityStateCountry({ ...params, country_id: countryId }),
    enabled: (options?.enabled ?? true) && !!countryId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data: any) => data?.data,
    ...options,
  });
}

export function useCities(
  stateId?: string,
  params: Omit<GeoParams, "country_id" | "state_id"> = { combobox: true },
  options?: any
) {
  return useQuery({
    queryKey: queryKeys.locations.list({ ...params, state_id: stateId }),
    queryFn: () => listCityStateCountry({ ...params, state_id: stateId }),
    enabled: (options?.enabled ?? true) && !!stateId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data: any) => data?.data,
    ...options,
  });
}

export function useListCity(params: GeoParams, options?: any) {
  return useQuery({
    queryKey: [...queryKeys.locations.all, "list-city", params],
    queryFn: () => listCity(params),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data: any) => data?.data,
    ...options,
  });
}
