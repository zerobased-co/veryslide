export function randomInt(min, max) {
  return Math.floor((Math.random() * (max - min + 1)) + min);
}

export function randomColor() {
  var colors = [
    "#1ABC9C", "#2ECC71", "#3498DB", "#9B59B6",
    "#34495E", "#16A085", "#27AE60", "#2980B9",
    "#E74C3C", "#657F86", "#95A5A6", "#F39C12",
    "#D35400", "#C0392B", "#BDC3C7", "#7F8C8D",
  ];
  return colors[randomInt(0, colors.length - 1)];
}

export function properTextColor(color) {
  var r, g, b, hsp;

  color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));
  r = color >> 16;
  g = color >> 8 & 255;
  b = color & 255;

  hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  if (hsp > 127.5) {
    return '#000000';
  } else {
    return '#FFFFFF';
  }
}

export function debounce(func, delay) {
  let inDebounce;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(inDebounce);
    inDebounce = setTimeout(() => func.apply(context, args), delay);
  };
}

// code from https://stackoverflow.com/a/2117523/366908
export function uuid() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

export function fadeOutAndRemove(elem, duration) {
  duration = duration || 250;
  elem.style.transition = "opacity " + (duration / 1000) + "s ease";
  elem.style.opacity = 0;

  setTimeout(() => {
    elem.remove()
  }, duration);
}

export function showLoadingIndicator(elem, isLoading, duration) {
  if (elem.loadingNode) {
    fadeOutAndRemove(elem.loadingNode, duration);
    elem.loadingNode = null;
  }

  if (isLoading === true) {
    elem.loadingNode = document.createElement('div');
    elem.loadingNode.className = 'vs-loading';
    elem.loadingNode.setAttribute('data-render-ignore', 'true');

    let icon = document.createElement('img');
    icon.src = '/static/icons/loading.svg';

    elem.loadingNode.append(icon);
    elem.node.append(elem.loadingNode);
  }
}

export const defaultDomToImageOption = {
  imagePlaceholder: '/static/icons/notfound.svg',
  filter: (node) => {
    if (node.nodeName === "#text")
      return true;
    return (!node.hasAttribute('data-render-ignore'));
  },
}
