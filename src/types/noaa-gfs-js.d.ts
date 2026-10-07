// src/types/noaa-gfs-js.d.ts
declare module "noaa-gfs-js" {
  export interface GfsDataPoint {
    value: number;
    timestamp?: string;
  }

  export function get_gfs_data(
    resolution: string,
    date: string,
    hour: string,
    latRange: [number, number],
    lonRange: [number, number],
    increments: number,
    parameter: string,
    convertTimes: boolean
  ): Promise<GfsDataPoint[] | undefined>;
}