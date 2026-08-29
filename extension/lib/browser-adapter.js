/**
 * TabVault Universal Cross-Browser Adapter
 * Normalizes differences between Chrome, Firefox, Safari, Edge, and Brave.
 * Exposes a standardized Promise-based WebExtension API namespace.
 */

(function (global) {
  const isBrowserDefined = typeof browser !== 'undefined';
  const isChromeDefined = typeof chrome !== 'undefined';

  const root = isBrowserDefined ? browser : (isChromeDefined ? chrome : {});

  const TabVaultAPI = {
    // 1. Storage API (Promise-based)
    storage: {
      local: {
        async get(keys) {
          if (root.storage && root.storage.local) {
            if (isBrowserDefined && root.storage.local.get.length <= 1) {
              return root.storage.local.get(keys);
            }
            return new Promise((resolve, reject) => {
              root.storage.local.get(keys, (result) => {
                if (chrome && chrome.runtime && chrome.runtime.lastError) {
                  return reject(chrome.runtime.lastError);
                }
                resolve(result || {});
              });
            });
          }
          return {};
        },

        async set(items) {
          if (root.storage && root.storage.local) {
            if (isBrowserDefined && root.storage.local.set.length <= 1) {
              return root.storage.local.set(items);
            }
            return new Promise((resolve, reject) => {
              root.storage.local.set(items, () => {
                if (chrome && chrome.runtime && chrome.runtime.lastError) {
                  return reject(chrome.runtime.lastError);
                }
                resolve();
              });
            });
          }
        },

        async remove(keys) {
          if (root.storage && root.storage.local) {
            if (isBrowserDefined && root.storage.local.remove.length <= 1) {
              return root.storage.local.remove(keys);
            }
            return new Promise((resolve, reject) => {
              root.storage.local.remove(keys, () => {
                if (chrome && chrome.runtime && chrome.runtime.lastError) {
                  return reject(chrome.runtime.lastError);
                }
                resolve();
              });
            });
          }
        },
      },
    },

    // 2. Tabs API (Promise-based)
    tabs: {
      async query(queryInfo) {
        if (root.tabs && root.tabs.query) {
          if (isBrowserDefined && root.tabs.query.length <= 1) {
            return root.tabs.query(queryInfo);
          }
          return new Promise((resolve, reject) => {
            root.tabs.query(queryInfo, (tabs) => {
              if (chrome && chrome.runtime && chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
              }
              resolve(tabs || []);
            });
          });
        }
        return [];
      },

      async create(createProperties) {
        if (root.tabs && root.tabs.create) {
          if (isBrowserDefined && root.tabs.create.length <= 1) {
            return root.tabs.create(createProperties);
          }
          return new Promise((resolve, reject) => {
            root.tabs.create(createProperties, (tab) => {
              if (chrome && chrome.runtime && chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
              }
              resolve(tab);
            });
          });
        }
      },

      async update(tabId, updateProperties) {
        if (root.tabs && root.tabs.update) {
          return new Promise((resolve, reject) => {
            root.tabs.update(tabId, updateProperties, (tab) => {
              if (chrome && chrome.runtime && chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
              }
              resolve(tab);
            });
          });
        }
      },

      async remove(tabIds) {
        if (root.tabs && root.tabs.remove) {
          return new Promise((resolve, reject) => {
            root.tabs.remove(tabIds, () => {
              if (chrome && chrome.runtime && chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
              }
              resolve();
            });
          });
        }
      },
    },

    // 3. Windows API
    windows: {
      async create(createData) {
        if (root.windows && root.windows.create) {
          return new Promise((resolve, reject) => {
            root.windows.create(createData, (win) => {
              if (chrome && chrome.runtime && chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
              }
              resolve(win);
            });
          });
        }
      },
    },

    // 4. Runtime API
    runtime: {
      getURL(path) {
        return root.runtime ? root.runtime.getURL(path) : path;
      },

      async sendMessage(message) {
        if (root.runtime && root.runtime.sendMessage) {
          return new Promise((resolve) => {
            try {
              root.runtime.sendMessage(message, (response) => {
                resolve(response);
              });
            } catch (e) {
              resolve(null);
            }
          });
        }
      },

      onMessage: {
        addListener(callback) {
          if (root.runtime && root.runtime.onMessage) {
            root.runtime.onMessage.addListener(callback);
          }
        },
      },
    },

    // 5. Alarms API (for background periodic sync)
    alarms: {
      create(name, alarmInfo) {
        if (root.alarms && root.alarms.create) {
          root.alarms.create(name, alarmInfo);
        }
      },
      clear(name) {
        if (root.alarms && root.alarms.clear) {
          return new Promise((resolve) => {
            root.alarms.clear(name, (wasCleared) => resolve(wasCleared));
          });
        }
      },
      onAlarm: {
        addListener(callback) {
          if (root.alarms && root.alarms.onAlarm) {
            root.alarms.onAlarm.addListener(callback);
          }
        },
      },
    },

    // 6. Context Menus
    contextMenus: {
      create(createProperties, callback) {
        if (root.contextMenus && root.contextMenus.create) {
          root.contextMenus.create(createProperties, callback);
        }
      },
      onClicked: {
        addListener(callback) {
          if (root.contextMenus && root.contextMenus.onClicked) {
            root.contextMenus.onClicked.addListener(callback);
          }
        },
      },
    },
  };

  global.TabVaultAPI = TabVaultAPI;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
