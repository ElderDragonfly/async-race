import {
  StartEngineResponse,
  DriveEngineResponse,
} from "../types/engine.types";
import { httpRequest } from "./http";

export class EngineApi {
  public startEngine(id: number): Promise<StartEngineResponse> {
    return httpRequest(`/engine?id=${id}&status=started`, { method: "PATCH" });
  }
  public stopEngine(id: number): Promise<StartEngineResponse> {
    return httpRequest(`/engine?id=${id}&status=stopped`, { method: "PATCH" });
  }
  public switchEngineToDrive(id: number): Promise<DriveEngineResponse> {
    return httpRequest(`/engine?id=${id}&status=drive`, { method: "PATCH" });
  }
}
