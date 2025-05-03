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

  this.panels = this.getPanels();

  if (this.tabs.length !== this.panels.length) return;

  this.cleanRegex = /[^a-zA-Z0-9]/g;
  this.paramKey = selector.replace(this.cleanRegex, '');
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

Tablix.prototype.getPanels = function () {
  return this.tabs
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
};

Tablix.prototype._findTabUrl = function () {
  const searchParams = new URLSearchParams(location.search);
  const tabSelector = searchParams.get(this.paramKey);
  return (
    this.otps.rememberTab &&
    tabSelector &&
    this.tabs.find(
      (tab) =>
        tab.getAttribute('href').replace(this.cleanRegex, '') === tabSelector
    )
  );
};

Tablix.prototype._init = function () {
  const tab = this._findTabUrl() || this.tabs[0];

  this._activateTab(tab, false, false);
  this.currentTab = tab;

  this.tabs.forEach((tab) => {
    tab.onclick = (e) => {
      e.preventDefault();
      this._tryActivateTab(tab);
    };
  });
};

Tablix.prototype._activateTab = function (
  tab,
  triggerOnChange = true,
  updateURL = this.otps.rememberTab
) {
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

  if (updateURL) {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set(
      this.paramKey,
      tab.getAttribute('href').replace(this.cleanRegex, '')
    );
    history.replaceState(null, null, `?${searchParams}`);
  }
};

// input: tab element or panel selector
Tablix.prototype.switch = function (input) {
  const tab =
    typeof input === 'string'
      ? this.tabs.find((tab) => tab.getAttribute('href') === input)
      : this.tabs.includes(input) && input;

  if (!tab) return console.error(`Tablix: No tab found with '${input}'`);

  this._tryActivateTab(tab);
};

Tablix.prototype._tryActivateTab = function (tab) {
  if (this.currentTab !== tab) {
    this.currentTab = tab;
    this._activateTab(tab);
  }
};

Tablix.prototype.destroy = function () {
  this.container.innerHTML = this._originalHTML;
  this.panels.forEach((panel) => (panel.hidden = false));
  this.container = null;
  this.panels = null;
  this.tabs = null;
  this.currentTab = null;
};
