/**
 * TabVault UI Components (Modular & Artistic Theme)
 * Reusable card renderers, archive/unarchive handling, flat grouped-tab view, and multi-directional drag resizing.
 */

(function (global) {
  const TabVaultUI = {
    /**
     * Create a complete, interactive Session Card DOM element
     */
    createSessionCard(session, handlers = {}) {
      const card = document.createElement('div');
      card.className = `session-card ${session.isPinned ? 'pinned' : ''} ${session.isArchived ? 'archived' : ''}`;
      card.dataset.sessionId = session.id;

      const activeTabs = (session.tabs || []).filter((t) => !t.isPopped);
      const timeAgo = this.formatTimeAgo(session.timestamp);

      // Device & Window metadata
      const devInfo = session.deviceInfo || {};
      const platformIcon = TabVaultDeviceManager.getPlatformIcon(devInfo.platform);
      const devName = devInfo.deviceName || 'My PC';
      const browserName = devInfo.browser || 'Browser';
      const winId = devInfo.windowId ? `Win #${devInfo.windowId}` : '';

      // Unique domains for clickable domain filter pills
      const domains = Array.from(
        new Set(activeTabs.map((t) => t.hostname).filter(Boolean))
      ).slice(0, 5);

      card.innerHTML = `
        <div class="session-header">
          <div class="session-info">
            ${
              !session.isArchived
                ? `
            <button class="sm-btn pin-btn" title="${session.isPinned ? 'Unpin session' : 'Pin session to top'}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="${session.isPinned ? '#e5a83b' : 'none'}" stroke="${session.isPinned ? '#e5a83b' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="17" x2="12" y2="22"></line>
                <path d="M5 17h14l-1.5-7H6.5L5 17z"></path>
                <path d="M9 10V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6"></path>
              </svg>
            </button>`
                : ''
            }

            <!-- Inline Editable Session Title -->
            <div class="session-title-wrapper">
              <span class="session-title" title="Double click or click edit to rename">${this.escapeHtml(session.title)}</span>
              <button class="icon-tiny-btn edit-title-btn" title="Rename Session">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
            </div>

            ${
              session.isArchived
                ? `<span class="session-badge archived-badge">📦 Archived</span>`
                : session.isRestored
                ? `<span class="session-badge restored-badge">🔄 Restored</span>`
                : `<span class="session-badge">${activeTabs.length} tabs</span>`
            }
          </div>

          <div class="session-actions">
            ${
              session.isRestored
                ? `
            <button class="sm-btn restash-btn" title="Re-stash: Move back to Active Sessions">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              </svg>
              Re-Stash
            </button>`
                : `
            <button class="sm-btn restore-btn" title="Restore all tabs in current window">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 14 15 14 15 20"></polyline>
                <path d="M20 4v7a2 2 0 0 1-2 2H4"></path>
              </svg>
              Restore
            </button>`
            }
            <button class="sm-btn new-win-btn" title="Open in new window">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </button>
            ${
              session.isArchived
                ? `
            <button class="sm-btn unarchive-btn" title="Unarchive session (move back to active sessions)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
              Unarchive
            </button>`
                : `
            <button class="sm-btn archive-btn" title="Archive session (safely move to Archive)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="21 8 21 21 3 21 3 8"></polyline>
                <rect x="1" y="3" width="22" height="5"></rect>
                <line x1="10" y1="12" x2="14" y2="12"></line>
              </svg>
              Archive
            </button>`
            }
          </div>
        </div>

        <!-- Metadata & Device Pills -->
        <div class="session-meta-bar">
          <div class="device-pill" title="Created on ${this.escapeHtml(devName)} (${this.escapeHtml(browserName)})">
            <span class="device-icon">${platformIcon}</span>
            <span class="device-name">${this.escapeHtml(devName)}</span>
            <span class="device-browser">${this.escapeHtml(browserName)}</span>
            ${winId ? `<span class="device-win">${winId}</span>` : ''}
          </div>

          <div class="domain-pills">
            <span class="domain-pill time-pill">${timeAgo}</span>
            ${domains
              .map(
                (d) =>
                  `<button class="domain-pill filterable-domain" data-domain="${this.escapeHtml(d)}" title="Filter by ${this.escapeHtml(d)}">${this.escapeHtml(d)}</button>`
              )
              .join('')}
          </div>
        </div>

        <!-- Tab Items (Flexes smoothly as parent card resizes) -->
        <div class="tab-list">
          ${activeTabs
            .map(
              (tab) => `
            <div class="tab-item" data-tab-id="${tab.id}">
              <a class="tab-link" href="#" data-url="${this.escapeHtml(tab.url)}" title="Click to open tab">
                <img class="tab-favicon" src="${tab.favIconUrl || 'icons/icon16.png'}" onerror="this.src='icons/icon16.png'" width="16" height="16" alt="" />
                <span class="tab-title">${this.escapeHtml(tab.title)}</span>
                <span class="tab-domain">${this.escapeHtml(tab.hostname || '')}</span>
              </a>

              <div class="tab-actions">
                <!-- Open Button -->
                <button class="action-icon-btn open-tab-btn" data-url="${this.escapeHtml(tab.url)}" title="Open tab">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </button>

                <!-- Pop Button (Icon only with clean 'Pop' tooltip) -->
                <button class="action-icon-btn pop-tab-btn" data-url="${this.escapeHtml(tab.url)}" data-tab-id="${tab.id}" title="Pop">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 4 4 14 20 14 12 4"></polygon>
                    <line x1="4" y1="19" x2="20" y2="19"></line>
                  </svg>
                </button>

                <!-- Delete Button -->
                <button class="action-icon-btn delete-tab-btn danger" data-tab-id="${tab.id}" title="Delete tab">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          `
            )
            .join('')}
        </div>

        <!-- Parent Card Corner & Bottom Resize Handles (Width + Height) -->
        <div class="card-corner-resizer" title="Drag to expand width and height">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5">
            <line x1="8" y1="2" x2="2" y2="8"></line>
            <line x1="8" y1="5" x2="5" y2="8"></line>
            <line x1="8" y1="8" x2="8" y2="8"></line>
          </svg>
        </div>
        <div class="card-bottom-resizer" title="Drag bottom to expand height"></div>
        <div class="card-right-resizer" title="Drag right edge to expand width"></div>
      `;

      // Event Listeners Binding
      const titleWrapper = card.querySelector('.session-title-wrapper');
      const titleSpan = card.querySelector('.session-title');
      const editTitleBtn = card.querySelector('.edit-title-btn');
      const pinBtn = card.querySelector('.pin-btn');
      const restoreBtn = card.querySelector('.restore-btn');
      const newWinBtn = card.querySelector('.new-win-btn');
      const archiveBtn = card.querySelector('.archive-btn');
      const unarchiveBtn = card.querySelector('.unarchive-btn');
      const cornerResizer = card.querySelector('.card-corner-resizer');
      const bottomResizer = card.querySelector('.card-bottom-resizer');
      const rightResizer = card.querySelector('.card-right-resizer');

      // Multi-Directional Smooth Parent Card Drag-to-Resize (Width + Height)
      const initCardResizing = () => {
        const startResize = (e, resizeWidth, resizeHeight) => {
          e.preventDefault();
          e.stopPropagation();

          const startX = e.clientX;
          const startY = e.clientY;
          const startWidth = card.getBoundingClientRect().width;
          const startHeight = card.getBoundingClientRect().height;

          const onMouseMove = (moveEvent) => {
            if (resizeWidth) {
              const dx = moveEvent.clientX - startX;
              const newWidth = Math.max(280, Math.min(1200, startWidth + dx));
              card.style.width = `${newWidth}px`;
              card.style.flex = `0 0 ${newWidth}px`;
            }
            if (resizeHeight) {
              const dy = moveEvent.clientY - startY;
              const newHeight = Math.max(140, Math.min(900, startHeight + dy));
              card.style.height = `${newHeight}px`;
            }
          };

          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
          };

          document.body.style.cursor = resizeWidth && resizeHeight ? 'nwse-resize' : resizeWidth ? 'ew-resize' : 'ns-resize';
          document.body.style.userSelect = 'none';
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        };

        if (cornerResizer) cornerResizer.addEventListener('mousedown', (e) => startResize(e, true, true));
        if (bottomResizer) bottomResizer.addEventListener('mousedown', (e) => startResize(e, false, true));
        if (rightResizer) rightResizer.addEventListener('mousedown', (e) => startResize(e, true, false));
      };

      initCardResizing();

      // Inline Session Renaming
      const startRename = () => {
        if (card.querySelector('.rename-input')) return;

        const currentTitle = session.title || 'Untitled Session';
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'rename-input';
        input.value = currentTitle;

        titleSpan.classList.add('hidden');
        editTitleBtn.classList.add('hidden');
        titleWrapper.appendChild(input);
        input.focus();
        input.select();

        const saveRename = async () => {
          const newTitle = input.value.trim();
          if (newTitle && newTitle !== currentTitle) {
            titleSpan.textContent = newTitle;
            if (handlers.onRename) {
              await handlers.onRename(session.id, newTitle);
            }
          }
          input.remove();
          titleSpan.classList.remove('hidden');
          editTitleBtn.classList.remove('hidden');
        };

        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            saveRename();
          } else if (e.key === 'Escape') {
            input.remove();
            titleSpan.classList.remove('hidden');
            editTitleBtn.classList.remove('hidden');
          }
        });

        input.addEventListener('blur', saveRename);
      };

      editTitleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startRename();
      });

      titleSpan.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        startRename();
      });

      const restashBtn = card.querySelector('.restash-btn');

      if (restashBtn) {
        restashBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (handlers.onRestashSession) handlers.onRestashSession(session.id);
        });
      }

      if (restoreBtn) {
        restoreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (handlers.onRestore) handlers.onRestore(session.id, false);
        });
      }

      if (newWinBtn) {
        newWinBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (handlers.onRestore) handlers.onRestore(session.id, true);
        });
      }

      if (archiveBtn) {
        archiveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (handlers.onArchiveSession) handlers.onArchiveSession(session.id);
        });
      }

      if (unarchiveBtn) {
        unarchiveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (handlers.onUnarchiveSession) handlers.onUnarchiveSession(session.id);
        });
      }

      // Domain chip filter click
      card.querySelectorAll('.filterable-domain').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const domain = btn.dataset.domain;
          if (handlers.onDomainFilter) handlers.onDomainFilter(domain);
        });
      });

      // Tab link click
      card.querySelectorAll('.tab-link').forEach((link) => {
        link.addEventListener('click', async (e) => {
          e.preventDefault();
          const url = link.dataset.url;
          if (handlers.onOpenTab) handlers.onOpenTab(url);
        });
      });

      // Open Tab Button
      card.querySelectorAll('.open-tab-btn').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const url = btn.dataset.url;
          if (handlers.onOpenTab) handlers.onOpenTab(url);
        });
      });

      // Pop Tab Button
      card.querySelectorAll('.pop-tab-btn').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const url = btn.dataset.url;
          const tabId = btn.dataset.tabId;
          if (handlers.onPopTab) handlers.onPopTab(session.id, tabId, url);
        });
      });

      // Delete Tab Button
      card.querySelectorAll('.delete-tab-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const tabId = btn.dataset.tabId;
          if (handlers.onDeleteTab) handlers.onDeleteTab(session.id, tabId);
        });
      });

      return card;
    },

    /**
     * Create a Grouped Tab Section element for "All Tabs" master view
     */
    createGroupedTabSection(group, handlers = {}) {
      const section = document.createElement('div');
      section.className = 'session-card grouped-tab-card';
      section.dataset.groupKey = group.key;

      const tabs = group.tabs || [];

      section.innerHTML = `
        <div class="session-header">
          <div class="session-info">
            <span class="group-icon">${group.icon || '📂'}</span>
            <span class="session-title">${this.escapeHtml(group.title)}</span>
            <span class="session-badge">${tabs.length} tabs</span>
          </div>

          <div class="session-actions">
            <button class="sm-btn restore-btn open-all-group-btn" title="Open all ${tabs.length} tabs in group">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 14 15 14 15 20"></polyline>
                <path d="M20 4v7a2 2 0 0 1-2 2H4"></path>
              </svg>
              Open All (${tabs.length})
            </button>
          </div>
        </div>

        <div class="tab-list">
          ${tabs
            .map(
              (tab) => `
            <div class="tab-item" data-session-id="${tab.sessionId}" data-tab-id="${tab.id}">
              <a class="tab-link" href="#" data-url="${this.escapeHtml(tab.url)}" title="Click to open tab">
                <img class="tab-favicon" src="${tab.favIconUrl || 'icons/icon16.png'}" onerror="this.src='icons/icon16.png'" width="16" height="16" alt="" />
                <span class="tab-title">${this.escapeHtml(tab.title)}</span>
                <span class="tab-session-tag" title="Originating session">${this.escapeHtml(tab.sessionTitle || '')}</span>
              </a>

              <div class="tab-actions">
                <button class="action-icon-btn open-tab-btn" data-url="${this.escapeHtml(tab.url)}" title="Open tab">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </button>

                <button class="action-icon-btn pop-tab-btn" data-url="${this.escapeHtml(tab.url)}" data-session-id="${tab.sessionId}" data-tab-id="${tab.id}" title="Pop">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polygon points="12 4 4 14 20 14 12 4"></polygon>
                    <line x1="4" y1="19" x2="20" y2="19"></line>
                  </svg>
                </button>

                <button class="action-icon-btn delete-tab-btn danger" data-session-id="${tab.sessionId}" data-tab-id="${tab.id}" title="Delete tab">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="card-corner-resizer" title="Drag to expand width and height">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5">
            <line x1="8" y1="2" x2="2" y2="8"></line>
            <line x1="8" y1="5" x2="5" y2="8"></line>
            <line x1="8" y1="8" x2="8" y2="8"></line>
          </svg>
        </div>
        <div class="card-bottom-resizer" title="Drag bottom to expand height"></div>
        <div class="card-right-resizer" title="Drag right edge to expand width"></div>
      `;

      // Open all tabs in group
      const openAllBtn = section.querySelector('.open-all-group-btn');
      if (openAllBtn) {
        openAllBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          for (const t of tabs) {
            if (handlers.onOpenTab) await handlers.onOpenTab(t.url);
          }
        });
      }

      // Tab link click
      section.querySelectorAll('.tab-link').forEach((link) => {
        link.addEventListener('click', async (e) => {
          e.preventDefault();
          const url = link.dataset.url;
          if (handlers.onOpenTab) handlers.onOpenTab(url);
        });
      });

      // Open Tab Button
      section.querySelectorAll('.open-tab-btn').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const url = btn.dataset.url;
          if (handlers.onOpenTab) handlers.onOpenTab(url);
        });
      });

      // Pop Tab Button
      section.querySelectorAll('.pop-tab-btn').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const url = btn.dataset.url;
          const sessionId = btn.dataset.sessionId;
          const tabId = btn.dataset.tabId;
          if (handlers.onPopTab) handlers.onPopTab(sessionId, tabId, url);
        });
      });

      // Delete Tab Button
      section.querySelectorAll('.delete-tab-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const sessionId = btn.dataset.sessionId;
          const tabId = btn.dataset.tabId;
          if (handlers.onDeleteTab) handlers.onDeleteTab(sessionId, tabId);
        });
      });

      // Resizers for grouped section
      const cornerResizer = section.querySelector('.card-corner-resizer');
      const bottomResizer = section.querySelector('.card-bottom-resizer');
      const rightResizer = section.querySelector('.card-right-resizer');

      const startResize = (e, resizeWidth, resizeHeight) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = section.getBoundingClientRect().width;
        const startHeight = section.getBoundingClientRect().height;

        const onMouseMove = (moveEvent) => {
          if (resizeWidth) {
            const dx = moveEvent.clientX - startX;
            const newWidth = Math.max(280, Math.min(1200, startWidth + dx));
            section.style.width = `${newWidth}px`;
            section.style.flex = `0 0 ${newWidth}px`;
          }
          if (resizeHeight) {
            const dy = moveEvent.clientY - startY;
            const newHeight = Math.max(140, Math.min(900, startHeight + dy));
            section.style.height = `${newHeight}px`;
          }
        };

        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        };

        document.body.style.cursor = resizeWidth && resizeHeight ? 'nwse-resize' : resizeWidth ? 'ew-resize' : 'ns-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      };

      if (cornerResizer) cornerResizer.addEventListener('mousedown', (e) => startResize(e, true, true));
      if (bottomResizer) bottomResizer.addEventListener('mousedown', (e) => startResize(e, false, true));
      if (rightResizer) rightResizer.addEventListener('mousedown', (e) => startResize(e, true, false));

      return section;
    },

    /**
     * Create an interactive Open Tab item row for the Tab Selector drawer
     */
    createOpenTabRow(tab, isSelected = true, onToggle = null) {
      const row = document.createElement('div');
      row.className = `open-tab-row ${isSelected ? 'selected' : ''}`;
      row.dataset.tabId = tab.id;

      let hostname = 'local';
      try {
        if (tab.url && tab.url.startsWith('http')) {
          hostname = new URL(tab.url).hostname.replace(/^www\./, '');
        }
      } catch (e) {}

      row.innerHTML = `
        <label class="open-tab-checkbox-label">
          <input type="checkbox" class="open-tab-checkbox" data-tab-id="${tab.id}" ${isSelected ? 'checked' : ''} />
          <span class="custom-checkbox-ui"></span>
        </label>
        <img class="tab-favicon" src="${tab.favIconUrl || 'icons/icon16.png'}" onerror="this.src='icons/icon16.png'" width="16" height="16" alt="" />
        <div class="open-tab-details">
          <span class="open-tab-title" title="${this.escapeHtml(tab.title || 'Untitled Tab')}">${this.escapeHtml(tab.title || 'Untitled Tab')}</span>
          <span class="open-tab-domain">${this.escapeHtml(hostname)}</span>
        </div>
      `;

      const checkbox = row.querySelector('.open-tab-checkbox');
      checkbox.addEventListener('change', (e) => {
        const checked = e.target.checked;
        row.classList.toggle('selected', checked);
        if (onToggle) onToggle(tab.id, checked);
      });

      row.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT' && !e.target.classList.contains('custom-checkbox-ui')) {
          checkbox.checked = !checkbox.checked;
          row.classList.toggle('selected', checkbox.checked);
          if (onToggle) onToggle(tab.id, checkbox.checked);
        }
      });

      return row;
    },

    /**
     * Create a Saved Link Item row/card
     */
    createSavedLinkItem(link, handlers = {}) {
      const item = document.createElement('div');
      item.className = `saved-link-item ${link.isRead ? 'read' : 'unread'}`;
      item.dataset.linkId = link.id;

      const timeAgo = this.formatTimeAgo(link.savedAt);
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${link.hostname}&sz=32`;

      item.innerHTML = `
        <div class="link-item-left">
          <label class="link-select-label" title="Select link">
            <input type="checkbox" class="link-checkbox" data-link-id="${link.id}" />
            <span class="custom-checkbox-ui"></span>
          </label>
          <img class="tab-favicon" src="${faviconUrl}" onerror="this.src='icons/icon16.png'" width="16" height="16" alt="" />
          <div class="link-details">
            <a href="#" class="link-title-anchor" data-url="${this.escapeHtml(link.url)}" title="${this.escapeHtml(link.url)}">
              ${this.escapeHtml(link.title || link.hostname || 'Saved Link')}
            </a>
            <div class="link-meta-row">
              <span class="link-domain-badge">${this.escapeHtml(link.hostname || 'link')}</span>
              <span class="link-time">${timeAgo}</span>
              ${link.isRead ? '<span class="read-status-badge">✓ Read</span>' : '<span class="unread-status-badge">● Unread</span>'}
            </div>
          </div>
        </div>

        <div class="link-actions">
          <button class="action-icon-btn toggle-read-btn" title="${link.isRead ? 'Mark as Unread' : 'Mark as Read'}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${link.isRead
                ? '<polyline points="20 6 9 17 4 12"></polyline>'
                : '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline>'}
            </svg>
          </button>
          <button class="action-icon-btn copy-link-btn" title="Copy URL">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="action-icon-btn open-link-btn" data-url="${this.escapeHtml(link.url)}" title="Open link in new tab">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </button>
          <button class="action-icon-btn delete-link-btn danger" title="Delete link">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;

      // Event Handlers
      const titleAnchor = item.querySelector('.link-title-anchor');
      const openBtn = item.querySelector('.open-link-btn');
      const toggleReadBtn = item.querySelector('.toggle-read-btn');
      const copyBtn = item.querySelector('.copy-link-btn');
      const deleteBtn = item.querySelector('.delete-link-btn');

      const handleOpen = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (handlers.onOpenLink) handlers.onOpenLink(link.url, link.id);
      };

      if (titleAnchor) titleAnchor.addEventListener('click', handleOpen);
      if (openBtn) openBtn.addEventListener('click', handleOpen);

      if (toggleReadBtn) {
        toggleReadBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (handlers.onToggleRead) handlers.onToggleRead(link.id, !link.isRead);
        });
      }

      if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(link.url).then(() => {
            copyBtn.classList.add('copied');
            setTimeout(() => copyBtn.classList.remove('copied'), 1200);
          });
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (handlers.onDeleteLink) handlers.onDeleteLink(link.id);
        });
      }

      return item;
    },

    formatTimeAgo(timestamp) {
      if (!timestamp) return 'Just now';
      const diff = Math.floor((Date.now() - timestamp) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    },

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },
  };

  global.TabVaultUI = TabVaultUI;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
