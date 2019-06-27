export function randomInt(min, max) {
  return Math.floor((Math.random() * (max - min + 1)) + min);
}

export function randomColor() {
  var colors = [
    "#1abc9c", "#2ecc71", "#3498db", "#9b59b6",
    "#34495e", "#16a085", "#27ae60", "#2980b9",
    "#e74c3c", "#657f86", "#95a5a6", "#f39c12",
    "#d35400", "#c0392b", "#bdc3c7", "#7f8c8d",
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
