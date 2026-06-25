export type Winner = {
  id: number;
  wins: number;
  time: number;
};

export type allWinnersResponse = {
  total: number;
  items: Winner[];
};

export type UpdateWinnerResponse = {
  wins: number;
  time: number;
};

export type WinnerCar = {
  id: number;
  color: string;
  name: string;
  bestTime: number;
  wins: number;
};
