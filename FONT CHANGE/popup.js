document.getElementById('applyFont').addEventListener('click', () => {
  const font = document.getElementById('fontFamily').value;
  const fontUrl = chrome.runtime.getURL('font/OpenDyslexic-Regular.woff2');
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {

       if (font=='OpenDyslexic-Regular'){   
         chrome.scripting.executeScript({
         target: {tabId: tabs[0].id},
	 function: changeFontD, args: [font,fontUrl]  
	});
	}
	else{   
         chrome.scripting.executeScript({
       	 target: {tabId: tabs[0].id},
	 function: changeFont, args: [font] 
	});
	}
   });
});
function changeFont(font) {
  let oldStyle = document.getElementById('dyslexic-style');
  	if (oldStyle) oldStyle.remove();
  oldStyle = document.getElementById('regular-font-style');
  	if (oldStyle) oldStyle.remove();
  setTimeout(() => {
  	const style = document.createElement('style');
  	style.id = 'regular-font-style';
  	style.textContent = `* { font-family: '${font}', sans-serif !important; }`;
  	document.documentElement.appendChild(style);
  	},100);
}  
function changeFontD(font,fontUrl) {
  let oldStyle = document.getElementById('regular-font-style');
	  if (oldStyle) oldStyle.remove();
  oldStyle = document.getElementById('dyslexic-style');
	  if (oldStyle) oldStyle.remove();
  setTimeout(() => { 	
	const style = document.createElement('style');
	style.textContent = `@font-face {
	font-family: 'OpenDyslexic-Regular';
	src: url('${fontUrl}')format('woff2');
  	}
  	* { font-family: 'OpenDyslexic-Regular', sans-serif !important;}
  	`;
	document.documentElement.appendChild(style);
	},100);
}
