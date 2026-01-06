let allowedTabs = new Map();

// Block requests to blocked sites before they load
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = new URL(details.url);
    const host = url.hostname;

    // Check if site is blocked
    return new Promise((resolve) => {
      chrome.storage.local.get(["blocked"], (data) => {
        const blocked = data.blocked || [];

        if (blocked.includes(host)) {
          // Check if this tab is allowed
          const tabAllowed = allowedTabs.get(details.tabId) || new Set();

          if (tabAllowed.has(host)) {
            resolve({ cancel: false });
          } else {
            // Block the request
            resolve({ cancel: true });
          }
        } else {
          resolve({ cancel: false });
        }
      });
    });
  },
  { urls: ["http://*/*", "https://*/*"] },
  ["blocking"],
);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // If there's no tab ID, reject the request
  const tabId = sender.tab ? sender.tab.id : undefined;
  if (!tabId) {
    sendResponse({ allowed: false, success: false });
    return true;
  }

  if (msg.type === "isAllowed") {
    // Check if the tab is allowed
    const tabAllowed = allowedTabs.get(tabId) || new Set();
    sendResponse({ allowed: tabAllowed.has(msg.host) });
  } else if (msg.type === "checkAndUnblock") {
    // Check if the password is correct
    chrome.storage.local.get(["password"], (data) => {
      if (msg.pass === data.password) {
        let tabAllowed = allowedTabs.get(tabId) || new Set();
        tabAllowed.add(msg.host);
        allowedTabs.set(tabId, tabAllowed);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false });
      }
    });
    return true; // Allow async response
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  allowedTabs.delete(tabId);
});
