(function() {
  function bionicText(text) {
    return text.split(/\s+/).map(word => {
      const len = Math.ceil(word.length / 2);
      return `<span class="bionic"><b>${word.slice(0, len)}</b>${word.slice(len)}</span>`;
    }).join(' ');
  }
  
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    if (node.parentNode.tagName !== 'SCRIPT' && node.parentNode.tagName !== 'STYLE') {
      node.parentNode.replaceChild(document.createTextNode(''), node);
      const span = document.createElement('span');
      span.innerHTML = bionicText(node.textContent);
      node.parentNode.insertBefore(span, node);
    }
  }
  
  const style = document.createElement('style');
  style.textContent = `.bionic { font-weight: normal; } .bionic b { font-weight: bold; }`;
  document.head.appendChild(style);
})();