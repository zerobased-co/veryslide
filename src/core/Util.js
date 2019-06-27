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
