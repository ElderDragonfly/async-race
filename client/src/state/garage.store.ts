import { Car, NewCar, UpdateCar } from "../types/car.types";
import { GarageApi } from "../api/garage.api";

type Listeners = () => void;
type Unsubscribe = () => void;

export class GarageStore {
  private garageApi: GarageApi;
  private readonly limit: number = 7;
  public totalCars: number = 0;
  public currentPage: number = 1;
  public lastPage: number = 1;
  public cars: Car[] = [];
  public selectedCar?: Car;
  private listeners: Set<Listeners> = new Set();
  private selectListeners: Set<Listeners> = new Set();

  constructor() {
    this.garageApi = new GarageApi();
    // this.init();
  }

  public init(): Promise<void> {
    return this.loadCarsPage();
  }

  // Загружаем машины с текущей страницы и общее их количество
  // и меняем соответствующие поля этого объекта
  private loadCarsPage(): Promise<void> {
    return this.garageApi.getCarsPage(this.currentPage).then((data) => {
      this.totalCars = data.total;
      this.cars = data.items;
      this.setLastPage();

      this.notify();
    });
  }

  // Создаём машину
  public postCar(newCar: NewCar): Promise<void> {
    // Если названия машины нет, то машину не создаём
    if (!newCar.name.trim()) return Promise.resolve();
    return this.garageApi.createCar(newCar).then(() => {
      return this.loadCarsPage();
    });
  }
  // Создаём множество машин
  public postCars(newCars: NewCar[]): Promise<void> {
    const promises: Promise<Car>[] = [];
    for (let i = 0; i < newCars.length; i++) {
      promises.push(this.garageApi.createCar(newCars[i]));
    }
    return Promise.all(promises).then(() => {
      return this.loadCarsPage();
    });
  }

  // Загружаем выбранную машину
  public loadCar(carId: number): Promise<void> {
    return this.garageApi.getCar(carId).then((data) => {
      this.selectedCar = data;

      this.selectNotify();
    });
  }

  // Удаляем машину
  public removeCar(carId: number): Promise<void> {
    return this.garageApi.deleteCar(carId).then(() => {
      return this.loadCarsPage();
    });
  }

  // Обновляем машину
  public updateCar(updateData: UpdateCar): Promise<void> {
    // Если машина не выбрана(какая-то ошибка) возвращает пустой промис
    if (!this.selectedCar) {
      return Promise.resolve();
    } else {
      // Меняем название и цвет выбранный машины на новый введённый, если ничего не введено, оставляем старый
      return (
        this.garageApi
          .updateCar(this.selectedCar.id, {
            name: updateData.name || this.selectedCar.name,
            color: updateData.color || this.selectedCar.color,
          })
          // Меняем данные выбранной машины на обновлённые в GarageStore
          .then((data) => {
            this.selectedCar = data;
          })
          // Загружаем обновлённую страницу заново
          .then(() => {
            return this.loadCarsPage();
          })
          // Сбрасываем выбранну машину после изменения машины
          .then(() => {
            this.resetSelectedCar();
          })
      );
    }
  }

  // -------------------------------------------------------------------------------------------------------
  // Загружаем следующую страницу
  public nextPage(): Promise<void> {
    if (this.checkNextPage()) {
      this.currentPage++;
      return this.loadCarsPage();
    }
    return Promise.resolve();
  }
  // Загружаем предыдущую страницу
  public prevPage(): Promise<void> {
    if (this.checkPrevPage()) {
      this.currentPage--;
      return this.loadCarsPage();
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
    if (this.totalCars === 0) {
      this.lastPage = 1;
      return;
    }
    if (this.totalCars % this.limit) {
      this.lastPage = Math.trunc(this.totalCars / this.limit) + 1;
    } else this.lastPage = Math.trunc(this.totalCars / this.limit);
  }

  // -------------------------------------------------------------------------------------------------------
  // Слушатели на создание машины
  public subscribe(listeners: Listeners): Unsubscribe {
    this.listeners.add(listeners);
    return () => this.listeners.delete(listeners);
  }
  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  // Слушатели на выбор машины
  public selectSubscribe(listeners: Listeners): Unsubscribe {
    this.selectListeners.add(listeners);
    return () => this.selectListeners.delete(listeners);
  }
  private selectNotify(): void {
    this.selectListeners.forEach((listener) => listener());
  }

  // Сбрасываем выбранную машину
  public resetSelectedCar(): void {
    this.selectedCar = undefined;
    this.selectNotify();
  }
}
