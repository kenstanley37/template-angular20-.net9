import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceIdService {

  private readonly storageKey = 'device-id';

  getDeviceId(): string {
    let deviceId = localStorage.getItem(this.storageKey);
    if (!deviceId) {
      deviceId = this.generateUUID();
      localStorage.setItem(this.storageKey, deviceId);
    }
    return deviceId;
  }

  private generateUUID(): string {
    // Simple UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
