import { httpRequest, httpRequestWithTotal } from "./http";
import { Car, NewCar, UpdateCar } from "../types/car.types";
import { Page } from "../types/utils.types";

export class GarageApi {
  public getCarsPage(
    pageNumber: number,
    limit: number = 7,
  ): Promise<Page<Car>> {
    return httpRequestWithTotal<Car>(
      `/garage/?_page=${pageNumber}&_limit=${limit}`,
    );
  }

  public getCar(carId: number): Promise<Car> {
    return httpRequest<Car>(`/garage/${carId}`);
  }

  public createCar(newCar: NewCar): Promise<Car> {
    const body = JSON.stringify(newCar);
    return httpRequest<Car>("/garage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  }

  public deleteCar(carId: number): Promise<void> {
    return httpRequest(`/garage/${carId}`, { method: "DELETE" });
  }

  public updateCar(carId: number, updateCar: UpdateCar): Promise<Car> {
    const body = JSON.stringify(updateCar);
    return httpRequest(`/garage/${carId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body,
    });
  }
}
