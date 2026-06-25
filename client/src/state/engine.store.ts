import { EngineApi } from "../api/engine.api";
import { Car } from "../types/car.types";
import {
  StartEngineResponse,
  DriveEngineResponse,
  SafeStartEngineResponce,
} from "../types/engine.types";

export class EngineStore {
  private engineApi: EngineApi;
  constructor() {
    this.engineApi = new EngineApi();
  }

  public startEngine(id: number): Promise<StartEngineResponse> {
    return this.engineApi.startEngine(id);
  }

  public stopEngine(id: number): Promise<StartEngineResponse> {
    return this.engineApi.stopEngine(id);
  }

  // Метод переключения двигателя
  public switchEngineToDrive(id: number): Promise<DriveEngineResponse> {
    return this.engineApi.switchEngineToDrive(id);
  }

  // Метод запуска двигателя для одной машины
  public safeStartEngine(id: number): Promise<SafeStartEngineResponce> {
    return this.engineApi
      .startEngine(id)
      .then((data) => {
        return {
          velocity: data.velocity,
          distance: data.distance,
          isStarted: true,
          isFinished: false,
          carId: id,
        };
      })
      .catch(() => {
        return {
          velocity: 0,
          distance: 0,
          isStarted: false,
          isFinished: false,
          carId: id,
        };
      });
  }

  // Метод запуска двигателя для нескольких машин
  public safeStartAllEngines(cars: Car[]): Promise<SafeStartEngineResponce[]> {
    const promises = cars.map((car) => {
      return this.safeStartEngine(car.id);
    });
    return Promise.all(promises);
  }
}
