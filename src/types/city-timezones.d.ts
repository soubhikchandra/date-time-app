// src/types/city-timezones.d.ts
declare module "city-timezones" {
  export interface CityRecord {
    city: string;
    city_ascii: string;
    lat: number;
    lng: number;
    pop: number;
    country: string;
    iso2: string;
    iso3: string;
    province: string;
    timezone: string;
  }

  interface CityTimezonesModule {
    cityMapping: CityRecord[];
    lookupViaCity(city: string): CityRecord[];
    findFromCityStateProvince(
      city: string,
      state: string,
      country: string
    ): CityRecord[];
  }

  const cityTimezones: CityTimezonesModule;
  export default cityTimezones;
}