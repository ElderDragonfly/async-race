export type Car = {
  id: number;
  name: string;
  color: string;
};

export type NewCar = {
  name: string;
  color: string;
};

export type UpdateCar = {
  name?: string;
  color?: string;
};

export type RaceCarState = {
  carElement: HTMLElement;
  trackElement: HTMLElement;
  carId: number;
};
