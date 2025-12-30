export type ReportJob = {
  id: string;
  deviceId: string;
  deviceName: string;
  format: string;
  status: string;
  from: string;
  to: string;
  failureReason: string | null;
  createdAt: string;
};

export type DeviceType = "TEMP" | "HUMIDITY" | "CO2" | "MOTION";

export type Device = {
  id: string;
  name: string;
  type: DeviceType;
  building: string;
  room: string;
  active: boolean;
};

export type PageResult<T> = {
  content: T[];
  totalElements: number;
  page: number;
  size: number;
};
