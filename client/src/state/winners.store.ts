import { GarageApi } from "../api/garage.api";
import { WinnersApi } from "../api/winner.api";
import { allWinnersResponse, Winner } from "../types/winners.types";
import { WinnerCar } from "../types/winners.types";

export class WinnersStore {
  private winnerApi: WinnersApi;
  private garageApi: GarageApi;
  public readonly limit: number = 10;
  public totalWinners: number = 0;
  public currentPage: number = 1;
  public lastPage: number = 1;
  public winnersCars: WinnerCar[];
  constructor() {
    this.winnerApi = new WinnersApi();
    this.garageApi = new GarageApi();
    this.winnersCars = [];
  }
  public init(
    sort: "id" | "wins" | "time" = "id",
    order: "ASC" | "DESC" = "ASC",
  ) {
    // Когда будет создаваться и вызываться init экземпляра этого класса,
    // то сначала отправляем запрос, чтобы все существующие победители
    // были записаны в соответствующие поля

    // Очищаем поле с массивом победителей
    this.winnersCars = [];
    return (
      this.loadAllWinners(sort, order)
        // Записываем общее число имеющихся победителей
        .then((winnersWithTotal) => {
          this.totalWinners = winnersWithTotal.total;
          return winnersWithTotal.items;
        })
        // Запрос для всех id победителей на машину, чтобы узнать название и цвет
        .then((winners) => {
          const promises = winners.map((winner) => {
            return this.garageApi
              .getCar(winner.id)
              .then((car) => {
                return {
                  id: car.id,
                  name: car.name,
                  color: car.color,
                  bestTime: winner.time,
                  wins: winner.wins,
                  status: "exists",
                };
              })
              .catch(() => {
                return {
                  id: winner.id,
                  name: "",
                  color: "",
                  bestTime: 0,
                  wins: 0,
                  status: "deleted",
                };
              });
          });
          // Записываем в поле победителей со всеми данными
          return Promise.all(promises)
            .then((cars) => {
              this.winnersCars = cars.filter((car) => {
                return car.status !== "deleted";
              });
            })
            .then(() => {
              this.setLastPage();
            });
        })
    );
  }

  // Получаем победителя
  public getWinner(winnerId: number) {
    return this.winnerApi.getWinner(winnerId);
  }

  // Получаем массив победитлей
  public loadAllWinners(
    sort: "id" | "wins" | "time" = "id",
    order: "ASC" | "DESC" = "ASC",
  ): Promise<allWinnersResponse> {
    return this.winnerApi.getAllWinners(
      this.currentPage,
      this.limit,
      sort,
      order,
    );
  }

  // Создаём победителя
  public createWinner(winner: Winner) {
    return this.winnerApi.createWinner(winner);
  }

  // Обновляем победителя
  public updateWinner(winner: Winner) {
    return this.winnerApi.updateWinner(winner);
  }

  // Удаляем победителя
  public removeWinner(carId: number): Promise<{}> {
    return this.winnerApi.deleteWinner(carId);
  }

  // -------------------------------------------------------------------------------------------------------
  // Загружаем следующую страницу
  public nextPage(): Promise<allWinnersResponse | void> {
    if (this.checkNextPage()) {
      this.currentPage++;
      return this.init();
    }
    return Promise.resolve();
  }
  // Загружаем предыдущую страницу
  public prevPage(): Promise<allWinnersResponse | void> {
    if (this.checkPrevPage()) {
      this.currentPage--;
      return this.init();
    }
    return Promise.resolve();
  }
  // Проверяем, существует ли следующая страница
  public checkNextPage(): boolean {
    if (this.currentPage === this.lastPage) {
      return false;
    } else return true;
  }
  // Проверяем, существует ли предыдущая страница
  public checkPrevPage(): boolean {
    if (this.currentPage === 1) {
      return false;
    } else return true;
  }
  // Устанавливаем поле 'последняя страница / lastPage'
  private setLastPage(): void {
    // Если машин в гараже нет, то страниц всё равно 1
    if (this.totalWinners === 0) {
      this.lastPage = 1;
      return;
    }
    if (this.totalWinners % this.limit) {
      this.lastPage = Math.trunc(this.totalWinners / this.limit) + 1;
    } else this.lastPage = Math.trunc(this.totalWinners / this.limit);
  }
}
