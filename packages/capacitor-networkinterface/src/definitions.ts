export interface NetworkInterfacePlugin {
  getWiFiIPAddress(): Promise<{ ip: string; mask: number; }>;
}
