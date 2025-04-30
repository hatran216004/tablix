function Tablix(selector, options) {
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

  this.paramKey = selector.replace(/[^a-zA-Z0-9]/g, '');
  this.otps = Object.assign(
    {
      activeClass: 'tablix--active',
      rememberTab: false,
      onChange: null
    },
    options
  );
  this._originalHTML = this.container.innerHTML;
  this._init();
}

Tablix.prototype._init = function () {
  const searchParams = new URLSearchParams(location.search);
  const tabSelector = searchParams.get(this.paramKey);
  const tab =
    (this.otps.rememberTab &&
      tabSelector &&
      this.tabs.find(
        (tab) =>
          tab.getAttribute('href').replace(/[^a-zA-Z0-9]/g, '') === tabSelector
      )) ||
    this.tabs[0];

  this._activateTab(tab, false);
  this.currentTab = tab;

  this.tabs.forEach((tab) => {
    tab.onclick = (e) => this._handleTabOnclick(e, tab);
  });
};

Tablix.prototype._handleTabOnclick = function (e, tab) {
  e.preventDefault();
  this._tryActivateTab(tab);
};

Tablix.prototype._activateTab = function (tab, triggerOnChange = true) {
  this.tabs.forEach((tab) => {
    tab.closest('li').classList.remove(this.otps.activeClass);
  });
  this.panels.forEach((panel) => (panel.hidden = true));

  tab.closest('li').classList.add(this.otps.activeClass);
  const activatePanel = document.querySelector(tab.getAttribute('href'));
  activatePanel.hidden = false;

  if (triggerOnChange && typeof this.otps.onChange === 'function') {
    this.otps.onChange({ tab, panel: activatePanel });
  }

  if (this.otps.rememberTab) {
    const searchParams = new URLSearchParams(location.search);
    const paramValue = tab.getAttribute('href').replace(/[^a-zA-Z0-9]/g, '');
    searchParams.set(this.paramKey, paramValue);
    history.replaceState(null, null, `?${searchParams}`);
  }
};

// selector: tabElement or panelSelector
Tablix.prototype.switch = function (input) {
  let activeTab = null;
  if (typeof input === 'string') {
    activeTab = this.tabs.find((tab) => tab.getAttribute('href') === input);
    if (!activeTab) {
      return console.error(`Tablix: No tab found with '${input}'`);
    }
  } else if (this.tabs.includes(input)) {
    activeTab = input;
  }
  if (!activeTab) return console.error(`Tablix: invalid switch input `);

  this._tryActivateTab(activeTab);
};

Tablix.prototype._tryActivateTab = function (tab) {
  if (this.currentTab !== tab) {
    this._activateTab(tab);
    this.currentTab = tab;
  }
};

Tablix.prototype.destroy = function () {
  this.container.innerHTML = this._originalHTML;
  this.panels.forEach((panel) => (panel.hidden = false));
  this.container = null;
  this.panels = null;
  this.tabs = null;
};
