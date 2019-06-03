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
