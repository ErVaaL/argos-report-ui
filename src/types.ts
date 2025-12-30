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
