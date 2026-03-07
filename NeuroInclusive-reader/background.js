chrome.runtime.onMessage.addListener((req, sender, sendResp) => {
  if (req.action === 'bionic' || req.action === 'focus') {
    chrome.scripting.executeScript({
      target: {tabId: req.tabId},
      files: req.action === 'bionic' ? ['content-bionic.js'] : ['content-focus.js']
    });
  }
  sendResp({done: true});
});
