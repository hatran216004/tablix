function Tablix(selector, options) {
  this.otps = Object.assign(
    {
      activeClass: 'tablix--active'
    },
    options
  );

  this.container = document.querySelector(selector);
  if (!this.container) {
    return console.error(
      `Tablix: No container found with selector '${selector}'`
    );
  }

  this.tabs = [...this.container.querySelectorAll('li a')];
  if (!this.tabs.length) {
    return console.error(`Tablix: No tabs found inside the container`);
  }

  this.panels = this.tabs
    .map((tab) => {
      const panel = document.querySelector(tab.getAttribute('href'));
      if (!panel) {
        console.error(
          `Tablix: No panel found with selector '${tab.getAttribute('href')}'`
        );
      }
      return panel;
    })
    .filter(Boolean);

  if (this.tabs.length !== this.panels.length) return;

  this._init();
}

Tablix.prototype._init = function () {
  const activeTab = this.tabs[0];
  const activePanel = this.panels[0];

  this._handleActiveTab(activeTab, activePanel);

  this.tabs.forEach((tab) => {
    tab.onclick = (e) => this._handleTabOnclick(e, tab);
  });
};

Tablix.prototype._handleTabOnclick = function (e, tab) {
  e.preventDefault();

  this.tabs.forEach((tab) => {
    tab.closest('li').classList.remove(this.otps.activeClass);
  });

  const activePanel = document.querySelector(tab.getAttribute('href'));
  this._handleActiveTab(tab, activePanel);
};

Tablix.prototype._handleActiveTab = function (tab, activePanel) {
  tab.closest('li').classList.add(this.otps.activeClass);
  this.panels.forEach((panel) => (panel.hidden = true));
  activePanel.hidden = false;
};
