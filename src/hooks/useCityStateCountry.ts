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

export function useCityStateCountry(params: GeoParams) {
  return useQuery({
    queryKey: queryKeys.locations.list(params),
    queryFn: () => listCityStateCountry(params),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => data?.data,
  });
}

export function useCountries(
  params: Omit<GeoParams, "country_id" | "state_id"> = { combobox: true },
) {
  return useQuery({
    queryKey: queryKeys.locations.list(params),
    queryFn: () => listCityStateCountry(params),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => data?.data,
  });
}

export function useStates(
  countryId?: string,
  params: Omit<GeoParams, "country_id" | "state_id"> = { combobox: true },
) {
  return useQuery({
    queryKey: queryKeys.locations.list({ ...params, country_id: countryId }),
    queryFn: () => listCityStateCountry({ ...params, country_id: countryId }),
    enabled: !!countryId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => data?.data,
  });
}

export function useCities(
  stateId?: string,
  params: Omit<GeoParams, "country_id" | "state_id"> = { combobox: true },
) {
  return useQuery({
    queryKey: queryKeys.locations.list({ ...params, state_id: stateId }),
    queryFn: () => listCityStateCountry({ ...params, state_id: stateId }),
    enabled: !!stateId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => data?.data,
  });
}

export function useListCity(params: GeoParams) {
  return useQuery({
    queryKey: [...queryKeys.locations.all, "list-city", params],
    queryFn: () => listCity(params),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => data?.data,
  });
}
