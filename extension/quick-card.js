// Lore Quick Flash Card Composer Window Logic

document.addEventListener('DOMContentLoaded', async () => {
  const cardContent = document.getElementById('card-content');
  const cardTitle = document.getElementById('card-title');
  const cardTags = document.getElementById('card-tags');
  const saveCardBtn = document.getElementById('save-card-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const closeBtn = document.getElementById('close-btn');
  const colorDots = document.getElementById('color-dots');
  const sourceBadge = document.getElementById('source-badge');
  const sourceText = document.getElementById('source-text');

  let selectedColor = 'charcoal';
  let sourceUrl = '';

  // 1. Parse URL Query Parameters (passed by background script)
  const params = new URLSearchParams(window.location.search);
  const initialTitle = params.get('title') || '';
  sourceUrl = params.get('sourceUrl') || '';
  const initialSelection = params.get('selection') || '';

  if (initialSelection) {
    cardContent.value = initialSelection;
  }
  if (initialTitle) {
    cardTitle.value = initialTitle;
  }
  if (sourceUrl) {
    sourceBadge.classList.remove('hidden');
    sourceText.textContent = `Source: ${sourceUrl}`;
    sourceBadge.title = sourceUrl;
  }

  // Focus textarea immediately
  setTimeout(() => {
    cardContent.focus();
    if (initialSelection) {
      cardContent.setSelectionRange(cardContent.value.length, cardContent.value.length);
    }
  }, 50);

  // 2. Color Selection
  colorDots.querySelectorAll('.color-dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      colorDots.querySelectorAll('.color-dot').forEach((d) => d.classList.remove('active'));
      dot.classList.add('active');
      selectedColor = dot.dataset.color || 'charcoal';
    });
  });

  // 3. Save Card Handler
  async function saveAndClose() {
    const content = cardContent.value.trim();
    if (!content) {
      cardContent.focus();
      cardContent.style.borderColor = 'var(--danger)';
      setTimeout(() => {
        cardContent.style.borderColor = '';
      }, 1000);
      return;
    }

    const title = cardTitle.value.trim();
    const tags = cardTags.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    saveCardBtn.disabled = true;
    const btnSpan = saveCardBtn.querySelector('span');
    if (btnSpan) btnSpan.textContent = 'Saving...';

    try {
      await TabVaultCardsManager.saveCard({
        content,
        title,
        color: selectedColor,
        tags,
        sourceUrl,
      });

      if (btnSpan) btnSpan.textContent = 'Saved! ✨';
      saveCardBtn.style.background = 'var(--accent-sage)';
      saveCardBtn.style.borderColor = 'var(--accent-sage)';
      saveCardBtn.style.color = '#ffffff';

      setTimeout(() => {
        window.close();
      }, 350);
    } catch (err) {
      alert(err.message || 'Failed to save card');
      saveCardBtn.disabled = false;
      if (btnSpan) btnSpan.textContent = 'Save Card';
    }
  }

  // 4. Close Handlers
  function closeWindow() {
    window.close();
  }

  saveCardBtn.addEventListener('click', saveAndClose);
  cancelBtn.addEventListener('click', closeWindow);
  closeBtn.addEventListener('click', closeWindow);

  // 5. Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      saveAndClose();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeWindow();
    }
  });
});
