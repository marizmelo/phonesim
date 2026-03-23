function initSettings() {
  renderDesignList();
}

function renderDesignList() {
  const list = document.getElementById('design-list');
  const currentDesign = localStorage.getItem('phoneDesign') || 'iphone';

  list.innerHTML = '';

  Object.entries(PHONE_DESIGNS).forEach(([key, design]) => {
    const item = document.createElement('div');
    item.className = 'settings-item' + (key === currentDesign ? ' selected' : '');
    item.innerHTML = `
      <div class="settings-item-left">
        <span class="settings-item-label">${design.name}</span>
      </div>
      <div class="settings-item-check">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    `;
    item.addEventListener('click', () => {
      applyDesign(key);
      renderDesignList();
    });
    list.appendChild(item);
  });
}
