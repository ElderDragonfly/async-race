export function randomInt(min: number, max: number) {
  min = Math.ceil(min); // округляем min вверх до целого
  max = Math.floor(max); // округляем max вниз до целого
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
