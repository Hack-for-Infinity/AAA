document.getElementById('applyFont').addEventListener('click', () => {
  const font = document.getElementById('fontFamily').value;

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      function: changeFont,
      args: [font]
    });
  });
});

function changeFont(font) {
  document.body.style.fontFamily = font ;
}
