(function () {
  const selector = document.getElementById("chartSelect");
  const saveStatus = document.getElementById("saveStatus");
  const sheets = Array.from(document.querySelectorAll(".sheet"));

  function getFields(container) {
    return container.querySelectorAll("input[type='text'], textarea, input[type='checkbox']");
  }

  function serialize(container) {
    const data = {};
    getFields(container).forEach((el, i) => {
      const key = el.name ? `${el.name}__${i}` : `field__${i}`;
      data[key] = el.type === "checkbox" ? el.checked : el.value;
    });
    return data;
  }

  function save(container) {
    const storageKey = container.dataset.storage;
    try {
      localStorage.setItem(storageKey, JSON.stringify(serialize(container)));
      if (saveStatus) saveStatus.textContent = "Saved " + new Date().toLocaleTimeString();
    } catch (e) {
      /* localStorage unavailable, ignore */
    }
  }

  function restore(container) {
    const storageKey = container.dataset.storage;
    let raw;
    try {
      raw = localStorage.getItem(storageKey);
    } catch (e) {
      return;
    }
    if (!raw) return;
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return;
    }
    getFields(container).forEach((el, i) => {
      const key = el.name ? `${el.name}__${i}` : `field__${i}`;
      if (!(key in data)) return;
      if (el.type === "checkbox") {
        el.checked = !!data[key];
      } else {
        el.value = data[key];
      }
    });
  }

  function showSelector() {
    sheets.forEach((s) => (s.hidden = true));
    selector.hidden = false;
    if (saveStatus) saveStatus.textContent = "";
    history.replaceState(null, "", location.pathname);
  }

  function showChart(id) {
    const target = document.getElementById(id);
    if (!target) return;
    selector.hidden = true;
    sheets.forEach((s) => (s.hidden = s !== target));
    if (saveStatus) saveStatus.textContent = "";
    history.replaceState(null, "", "#" + id);
    window.scrollTo(0, 0);
  }

  sheets.forEach((sheet) => {
    restore(sheet);

    let saveTimer = null;
    getFields(sheet).forEach((el) => {
      const evt = el.type === "checkbox" ? "change" : "input";
      el.addEventListener(evt, () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => save(sheet), 400);
      });
    });

    const clearBtn = sheet.querySelector(".clearBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (!confirm("Clear all fields on this chart? This cannot be undone.")) return;
        getFields(sheet).forEach((el) => {
          if (el.type === "checkbox") {
            el.checked = false;
          } else {
            el.value = "";
          }
        });
        try {
          localStorage.removeItem(sheet.dataset.storage);
        } catch (e) {}
        if (saveStatus) saveStatus.textContent = "Cleared";
      });
    }

    const exportBtn = sheet.querySelector(".exportBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        window.print();
      });
    }

    const backBtn = sheet.querySelector(".backBtn");
    if (backBtn) {
      backBtn.addEventListener("click", showSelector);
    }
  });

  document.querySelectorAll(".chart-card").forEach((card) => {
    card.addEventListener("click", () => showChart(card.dataset.target));
  });

  const initialId = location.hash.replace("#", "");
  if (initialId && document.getElementById(initialId)) {
    showChart(initialId);
  } else {
    showSelector();
  }
})();
