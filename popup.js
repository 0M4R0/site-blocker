let blocked = [];

const toggleListBtn = document.getElementById("toggleList");
const icon = document.getElementById("iconList");
const blockedList = document.getElementById("blockedList");

const loadData = () => {
  chrome.storage.local.get(["blocked"], (data) => {
    blocked = data.blocked || [];
    renderBlockedList();
  });
};

const renderBlockedList = () => {
  blockedList.innerHTML = "";
  blocked.forEach((site) => {
    const li = document.createElement("li");
    li.textContent = site;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeSite(site));
    li.appendChild(removeBtn);
    blockedList.appendChild(li);
  });

  // Check if current site is blocked and update slider
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      const url = new URL(tabs[0].url);
      const host = url.hostname;
      const addCurrentCheckbox = document.getElementById("addCurrent");

      if (blocked.includes(host)) {
        addCurrentCheckbox.checked = true;
        addCurrentCheckbox.classList.add("checked");
      } else {
        addCurrentCheckbox.checked = false;
        addCurrentCheckbox.classList.remove("checked");
      }
    }
  });
};

const saveBlocked = () => {
  chrome.storage.local.set({ blocked: blocked });
};

const addSite = (site) => {
  if (!blocked.includes(site)) {
    blocked.push(site);
    saveBlocked();
    loadData();
  }
};

// Remove site from blocked list and if it's the current site, reload it
const removeSite = (site) => {
  blocked = blocked.filter((s) => s !== site);
  saveBlocked();
  loadData();

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.url) return;

    const url = new URL(tabs[0].url);
    const host = url.hostname;
    if (host === site) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
};

document.getElementById("setPassword").addEventListener("click", () => {
  const pass = document.getElementById("passwordInput").value;
  if (!pass) {
    alert("Please enter a password");
    return;
  }

  chrome.storage.local.set({ password: pass });
  alert("Password set");
  document.getElementById("passwordInput").value = "";
});

const addCurrentCheckbox = document.getElementById("addCurrent");

addCurrentCheckbox.addEventListener("change", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      const url = new URL(tabs[0].url);
      const host = url.hostname;

      if (addCurrentCheckbox.checked) {
        // Add site to blocked list
        addSite(host);
        chrome.tabs.reload(tabs[0].id);
      } else {
        // Remove site from blocked list
        removeSite(host);
      }
    }
  });
});

toggleListBtn.addEventListener("click", () => {
  blockedList.classList.toggle("hidden");
  icon.classList.toggle("rotated");
});

loadData();
