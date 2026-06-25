import {
  UpdateWinnerResponse,
  allWinnersResponse,
  Winner,
} from "../types/winners.types";
import { httpRequest, httpRequestWithTotal } from "./http";

export class WinnersApi {
  public getWinner(carId: number): Promise<Winner> {
    return httpRequest(`/winners/${carId}`, { method: "GET" });
  }

  public getAllWinners(
    page: number,
    limit: number,
    sort: "id" | "wins" | "time" = "id",
    order: "ASC" | "DESC" = "ASC",
  ): Promise<allWinnersResponse> {
    return httpRequestWithTotal(
      `/winners?_page=${page}&_limit=${limit}&_sort=${sort}&_order=${order}`,
    );
  }

  public createWinner(winner: Winner): Promise<Winner> {
    return httpRequest(`/winners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(winner),
    });
  }

  public deleteWinner(carId: number): Promise<{}> {
    return httpRequest(`/winners/${carId}`, { method: "DELETE" });
  }

  public updateWinner(winner: Winner): Promise<UpdateWinnerResponse> {
    return httpRequest(`/winners/${winner.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wins: winner.wins, time: winner.time }),
    });
  }
}
