chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TAB_UPDATED') {
    chrome.tabs.query({}, tabs => {
      chrome.runtime.sendMessage({ 
        type: 'TABS_UPDATED',
        tabs: tabs 
      }).catch(() => {
        // Ignore connection errors when popup is closed
      });
    });
  }
  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.runtime.sendMessage({ type: 'TAB_UPDATED' }).catch(() => {});
  }
});

chrome.tabs.onRemoved.addListener(() => {
  chrome.runtime.sendMessage({ type: 'TAB_UPDATED' }).catch(() => {});
});