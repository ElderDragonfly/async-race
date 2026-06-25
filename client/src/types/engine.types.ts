export type StartEngineResponse = {
  velocity: number;
  distance: number;
};

export type SafeStartEngineResponce = {
  velocity: number;
  distance: number;
  isStarted: boolean;
  isFinished: boolean;
  carId: number;
};

export type DriveEngineResponse = {
  success: boolean;
};
