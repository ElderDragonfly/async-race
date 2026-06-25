import { randomInt } from "./randomizer";
import { CAR_BRANDS, CAR_MODELS } from "../constants/cars";
import { NewCar } from "../types/car.types";

// Возвращаем массив со 100 случайными машинами
export function randomCars(): NewCar[] {
  const cars: NewCar[] = [];
  for (let i = 0; i < 100; i++) {
    const newCar = {
      name: `${CAR_BRANDS[randomInt(0, CAR_BRANDS.length - 1)]} ${CAR_MODELS[randomInt(0, CAR_MODELS.length - 1)]}`,
      color: randomColor(),
    };
    cars.push(newCar);
  }
  return cars;
}

function randomColor(): string {
  let color = "#";
  for (let i = 0; i < 3; i++) {
    let colorPart = randomInt(0, 255).toString(16);
    if (colorPart.length < 2) {
      color += "0" + colorPart;
    } else color += colorPart;
  }
  return color;
}
