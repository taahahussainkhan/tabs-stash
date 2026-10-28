// Lore Extension - In-Page Centered Quick Flash Card Modal (Shadow DOM Isolated)

(function () {
  if (window.__loreCardInjected) return;
  window.__loreCardInjected = true;

  let shadowHost = null;
  let shadowRoot = null;
  let isModalOpen = false;
  let selectedCardColor = 'charcoal';

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggle_card_modal') {
      toggleModal();
      sendResponse({ success: true });
    }
  });

  // Listen for global page shortcut: Alt+C or Alt+Shift+C
  window.addEventListener(
    'keydown',
    (e) => {
      const isAltC = e.altKey && (e.key.toLowerCase() === 'c' || e.code === 'KeyC');
      if (isAltC) {
        e.preventDefault();
        e.stopPropagation();
        toggleModal();
      }
    },
    true
  );

  function createModalDOM() {
    if (shadowHost) return;

    shadowHost = document.createElement('div');
    shadowHost.id = 'lore-quick-card-root';
    shadowHost.style.position = 'fixed';
    shadowHost.style.top = '0';
    shadowHost.style.left = '0';
    shadowHost.style.width = '100vw';
    shadowHost.style.height = '100vh';
    shadowHost.style.zIndex = '2147483647';
    shadowHost.style.pointerEvents = 'none';

    shadowRoot = shadowHost.attachShadow({ mode: 'open' });

    shadowRoot.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 11, 14, 0.75);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.18s ease, visibility 0.18s ease;
          pointer-events: auto;
        }

        .overlay.active {
          opacity: 1;
          visibility: visible;
        }

        .card-modal {
          width: 100%;
          max-width: 520px;
          background: #191b20;
          border: 1.5px solid #e5a83b;
          border-radius: 10px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(229, 168, 59, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: scale(0.96) translateY(6px);
          transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          color: #f4f4f6;
        }

        .overlay.active .card-modal {
          transform: scale(1) translateY(0);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #202228;
          border-bottom: 1px solid #31343e;
        }

        .brand-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-box {
          width: 24px;
          height: 24px;
          background: #e5a83b;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #121316;
        }

        .modal-title {
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: -0.2px;
          color: #f4f4f6;
        }

        .hotkey-hint {
          font-size: 10px;
          font-family: ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace;
          color: #8a90a0;
          margin-left: 6px;
        }

        .close-btn {
          background: none;
          border: none;
          color: #a1a6b4;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
          transition: all 0.15s ease;
        }

        .close-btn:hover {
          background: #31343e;
          color: #ffffff;
        }

        .modal-body {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .card-textarea {
          width: 100%;
          min-height: 150px;
          max-height: 240px;
          background: #121316;
          border: 1.5px solid #31343e;
          border-radius: 6px;
          color: #f4f4f6;
          font-size: 13.5px;
          line-height: 1.5;
          padding: 10px 12px;
          outline: none;
          resize: vertical;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .card-textarea:focus {
          border-color: #e5a83b;
          box-shadow: 0 0 0 1px #e5a83b;
        }

        .meta-row {
          display: flex;
          gap: 8px;
        }

        .meta-input {
          flex: 1;
          background: #121316;
          border: 1px solid #31343e;
          border-radius: 4px;
          color: #f4f4f6;
          font-size: 11.5px;
          padding: 6px 10px;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .meta-input:focus {
          border-color: #e5a83b;
        }

        .source-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          background: #15161a;
          border: 1px solid #272a32;
          border-radius: 4px;
          font-size: 11px;
          color: #a1a6b4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .source-pill span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 6px;
          border-top: 1px solid #272a32;
        }

        .color-picker {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .color-dot {
          width: 17px;
          height: 17px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: transform 0.15s ease;
          padding: 0;
        }

        .color-dot:hover {
          transform: scale(1.2);
        }

        .color-dot.active {
          border-color: #ffffff;
          transform: scale(1.25);
        }

        .actions-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cancel-btn {
          background: #202228;
          border: 1px solid #31343e;
          color: #a1a6b4;
          font-size: 11.5px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .cancel-btn:hover {
          background: #262931;
          color: #f4f4f6;
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #e5a83b;
          border: 1px solid #f59e0b;
          color: #121316;
          font-size: 11.5px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .save-btn:hover {
          background: #f59e0b;
          box-shadow: 0 2px 8px rgba(229, 168, 59, 0.3);
        }

        .save-btn.saved {
          background: #38a169 !important;
          border-color: #38a169 !important;
          color: #ffffff !important;
        }

        .key-badge {
          font-size: 9px;
          font-family: ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace;
          background: rgba(0, 0, 0, 0.2);
          padding: 1px 4px;
          border-radius: 2px;
        }
      </style>

      <div class="overlay" id="overlay">
        <div class="card-modal" id="card-modal">
          <div class="modal-header">
            <div class="brand-group">
              <div class="logo-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
              </div>
              <span class="modal-title">⚡ Quick Flash Card</span>
              <span class="hotkey-hint">Ctrl+Enter to save • Esc to close</span>
            </div>
            <button class="close-btn" id="close-btn" title="Close (Esc)">&times;</button>
          </div>

          <div class="modal-body">
            <textarea class="card-textarea" id="card-content"
              placeholder="Paste or type anything here... text, notes, code snippets, ideas, reminders..." autofocus></textarea>

            <div class="meta-row">
              <input type="text" class="meta-input" id="card-title" placeholder="Title (optional, auto from 1st line)" />
              <input type="text" class="meta-input" id="card-tags" placeholder="Tags (comma-separated, optional)" />
            </div>

            <div class="source-pill" id="source-pill">
              <span>🔗 <strong id="source-title">Page</strong> • <span id="source-url">url</span></span>
            </div>

            <div class="modal-footer">
              <div class="color-picker" id="color-picker">
                <button type="button" class="color-dot active" data-color="charcoal" title="Charcoal" style="background:#202228;"></button>
                <button type="button" class="color-dot" data-color="terracotta" title="Terracotta" style="background:#e05a47;"></button>
                <button type="button" class="color-dot" data-color="ochre" title="Warm Ochre" style="background:#e5a83b;"></button>
                <button type="button" class="color-dot" data-color="sage" title="Sage Green" style="background:#38a169;"></button>
                <button type="button" class="color-dot" data-color="cyan" title="Teal Cyan" style="background:#0d9488;"></button>
                <button type="button" class="color-dot" data-color="purple" title="Royal Purple" style="background:#5c67f2;"></button>
              </div>

              <div class="actions-right">
                <button type="button" class="cancel-btn" id="cancel-btn">Cancel</button>
                <button type="button" class="save-btn" id="save-btn">
                  <span>Save Card</span>
                  <span class="key-badge">Ctrl+↵</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.documentElement.appendChild(shadowHost);

    // Bind internal events
    const overlay = shadowRoot.getElementById('overlay');
    const closeBtn = shadowRoot.getElementById('close-btn');
    const cancelBtn = shadowRoot.getElementById('cancel-btn');
    const saveBtn = shadowRoot.getElementById('save-btn');
    const contentInput = shadowRoot.getElementById('card-content');
    const colorPicker = shadowRoot.getElementById('color-picker');

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    colorPicker.querySelectorAll('.color-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        colorPicker.querySelectorAll('.color-dot').forEach((d) => d.classList.remove('active'));
        dot.classList.add('active');
        selectedCardColor = dot.dataset.color || 'charcoal';
      });
    });

    saveBtn.addEventListener('click', handleSave);

    contentInput.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }
    });

    shadowRoot.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }
    });
  }

  function openModal() {
    createModalDOM();

    const overlay = shadowRoot.getElementById('overlay');
    const contentInput = shadowRoot.getElementById('card-content');
    const titleInput = shadowRoot.getElementById('card-title');
    const sourceTitle = shadowRoot.getElementById('source-title');
    const sourceUrl = shadowRoot.getElementById('source-url');

    // Pre-populate with selected text if any
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      contentInput.value = selectedText;
    }

    sourceTitle.textContent = document.title || 'Current Webpage';
    sourceUrl.textContent = window.location.href;

    shadowHost.style.pointerEvents = 'auto';
    overlay.classList.add('active');
    isModalOpen = true;

    setTimeout(() => {
      contentInput.focus();
      if (selectedText) {
        contentInput.setSelectionRange(contentInput.value.length, contentInput.value.length);
      }
    }, 50);
  }

  function closeModal() {
    if (!shadowHost || !isModalOpen) return;
    const overlay = shadowRoot.getElementById('overlay');
    overlay.classList.remove('active');
    shadowHost.style.pointerEvents = 'none';
    isModalOpen = false;
  }

  function toggleModal() {
    if (isModalOpen) {
      closeModal();
    } else {
      openModal();
    }
  }

  async function handleSave() {
    const contentInput = shadowRoot.getElementById('card-content');
    const titleInput = shadowRoot.getElementById('card-title');
    const tagsInput = shadowRoot.getElementById('card-tags');
    const saveBtn = shadowRoot.getElementById('save-btn');
    const btnSpan = saveBtn.querySelector('span');

    const content = contentInput.value.trim();
    if (!content) {
      contentInput.focus();
      contentInput.style.borderColor = '#e53e3e';
      setTimeout(() => {
        contentInput.style.borderColor = '';
      }, 1000);
      return;
    }

    const title = titleInput.value.trim() || document.title;
    const tags = tagsInput.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    saveBtn.disabled = true;
    btnSpan.textContent = 'Saving...';

    chrome.runtime.sendMessage(
      {
        action: 'save_card',
        card: {
          content,
          title,
          color: selectedCardColor,
          tags,
          sourceUrl: window.location.href,
        },
      },
      (response) => {
        if (response && response.success) {
          btnSpan.textContent = 'Saved! ✨';
          saveBtn.classList.add('saved');
          setTimeout(() => {
            contentInput.value = '';
            titleInput.value = '';
            tagsInput.value = '';
            saveBtn.classList.remove('saved');
            saveBtn.disabled = false;
            btnSpan.textContent = 'Save Card';
            closeModal();
          }, 350);
        } else {
          alert((response && response.error) || 'Failed to save card');
          saveBtn.disabled = false;
          btnSpan.textContent = 'Save Card';
        }
      }
    );
  }
})();
