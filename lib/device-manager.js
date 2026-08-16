/**
 * TabVault Device & PC Manager (Modular)
 * Manages device identity, OS & browser detection, custom PC renaming, and window tracking.
 */

(function (global) {
  class TabVaultDeviceManager {
    constructor() {
      this.deviceInfo = null;
      this.initPromise = this.init();
    }

    async init() {
      const data = await TabVaultAPI.storage.local.get(['tabvault_device_id', 'tabvault_device_name']);
      
      let deviceId = data.tabvault_device_id;
      if (!deviceId) {
        deviceId = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
        await TabVaultAPI.storage.local.set({ tabvault_device_id: deviceId });
      }

      const platform = this.detectPlatform();
      const browser = this.detectBrowser();

      let deviceName = data.tabvault_device_name;
      if (!deviceName) {
        deviceName = `${platform} PC`;
        await TabVaultAPI.storage.local.set({ tabvault_device_name: deviceName });
      }

      this.deviceInfo = {
        deviceId,
        deviceName,
        platform,
        browser,
      };

      return this.deviceInfo;
    }

    detectPlatform() {
      const ua = navigator.userAgent || '';
      const platform = navigator.platform || '';

      if (/Mac|iPhone|iPod|iPad/i.test(platform) || /Macintosh|Mac OS X/i.test(ua)) {
        return 'macOS';
      }
      if (/Win/i.test(platform) || /Windows/i.test(ua)) {
        return 'Windows';
      }
      if (/Linux/i.test(platform) || /Linux/i.test(ua)) {
        return 'Linux';
      }
      if (/CrOS/i.test(ua)) {
        return 'ChromeOS';
      }
      return 'PC';
    }

    detectBrowser() {
      const ua = navigator.userAgent || '';

      if (ua.includes('Edg/')) return 'Edge';
      if (ua.includes('Firefox/')) return 'Firefox';
      if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
      if (ua.includes('Brave/') || (navigator.brave && typeof navigator.brave.isBrave === 'function')) return 'Brave';
      if (ua.includes('Chrome/')) return 'Chrome';
      if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
      return 'Browser';
    }

    async getDeviceInfo(windowId = 1) {
      if (!this.deviceInfo) {
        await this.initPromise;
      }
      return {
        ...this.deviceInfo,
        windowId: windowId || 1,
      };
    }

    async setDeviceName(newName) {
      const trimmed = (newName || '').trim();
      if (!trimmed) return;

      this.deviceInfo.deviceName = trimmed;
      await TabVaultAPI.storage.local.set({ tabvault_device_name: trimmed });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tabvault:device-updated', { detail: this.deviceInfo }));
      }
    }

    getPlatformIcon(platform) {
      const p = (platform || '').toLowerCase();
      if (p.includes('mac') || p.includes('apple')) return '🍎';
      if (p.includes('win')) return '💻';
      if (p.includes('linux')) return '🐧';
      if (p.includes('cros') || p.includes('chrome')) return '🌐';
      return '🖥️';
    }
  }

  global.TabVaultDeviceManager = new TabVaultDeviceManager();
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
