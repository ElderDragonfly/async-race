import { EngineStore } from "../../../state/engine.store";
import { GarageStore } from "../../../state/garage.store";
import { WinnersStore } from "../../../state/winners.store";
import { Car, NewCar, UpdateCar } from "../../../types/car.types";
import { SafeStartEngineResponce } from "../../../types/engine.types";
import { Winner } from "../../../types/winners.types";
import { ElementCreator } from "../../../utils/element-creator";
import { GarageCars } from "./garage-cars";
import { GarageControls } from "./garage-controls";

export class GaragePage {
  private parent: HTMLElement;
  private garageStore: GarageStore;
  private engineStore: EngineStore;
  private winnersStore: WinnersStore;
  private isRaceActive: boolean = false;
  // Поле для проверки текущей гонки
  private raceId: number = 0;
  private stoppedRaceCars = new Set<number>();
  constructor(parent: HTMLElement) {
    this.parent = parent;
    this.garageStore = new GarageStore();
    this.engineStore = new EngineStore();
    this.winnersStore = new WinnersStore();
    this.init();
  }
  // Дожидаемся ответа от сервера и инициируем рендер страницы
  private init() {
    this.garageStore.init().then(() => {
      this.renderGaragePage();
    });
  }

  private renderGaragePage() {
    const garage = new ElementCreator("div", this.parent, "garage");
    // Создаём блок кнопок модификации и создания машин
    const garageControls = new GarageControls(
      // onCreate
      garage.getElement(),
      (car: NewCar) => {
        this.garageStore.postCar(car);
      },
      // onUpdate
      (car: UpdateCar) => {
        this.garageStore.updateCar(car);
      },
      // onGenerateCars
      (cars: NewCar[]) => {
        return this.garageStore.postCars(cars);
      },
      // Запуск общей гонки у тех машин, у которых завёлся двигатель
      // onRaceStart
      () => {
        // Проверяем есть ли хоть одна машина
        if (this.garageStore.cars.length === 0) {
          return;
        }
        // Переключаем state в режим гонки
        // Выключаем ненужные кнопки при запуске гонки
        this.setRaceMode(true, [
          ...garageControls.raceLockedControls,
          ...garageCars.paginationRaceLockedControls,
          ...garageCars.carRaceLockedControls,
        ]);
        // Очищаем Set с id машинами, остановленными кнопкой B
        this.stoppedRaceCars.clear();
        // Создаём константу для текущей гонки
        this.raceId += 1;
        const currentRaceId = this.raceId;
        // Переключаем флаг что гонка активна
        // this.isRaceActive = true;
        this.startCarsEngines(currentRaceId, garageCars).then((startedCars) => {
          // Проверка что хоть у одной машины завёлся двигатель
          if (startedCars.length === 0) {
            this.setRaceMode(false, [
              ...garageControls.raceLockedControls,
              ...garageCars.paginationRaceLockedControls,
              ...garageCars.carRaceLockedControls,
            ]);

            return;
          }
          return this.switchCarsEngines(
            startedCars,
            currentRaceId,
            garageCars,
            garageControls,
          );
        });
        return;
      },
      // onRaceStop
      () => {
        const promises = this.garageStore.cars.map((car) => {
          return garageCars.stopCar(garageCars.carState[car.id]);
        });
        // Изменяем ID гонки, чтобы результаты этой не учитывались
        this.raceId += 1;
        // Гонка завершена
        this.setRaceMode(false, [
          ...garageControls.raceLockedControls,
          ...garageCars.paginationRaceLockedControls,
          ...garageCars.carRaceLockedControls,
        ]);
        return Promise.all(promises);
      },
    );
    // Подписываемся на событие выбора машины по клику
    this.garageStore.selectSubscribe(() => {
      garageControls.setSelectedCar(this.garageStore.selectedCar);
    });

    // -------------------------------------------------------------------------------------------------------
    // Создаём блок с машинами
    const garageCarsParent = new ElementCreator(
      "div",
      garage.getElement(),
      "garage__cars",
    );
    const garageCars = new GarageCars(
      garageCarsParent.getElement(),
      this.garageStore,
      // onSelect
      (carId: number) => {
        return this.garageStore.loadCar(carId);
      },
      // onRemove
      (carId: number) => {
        // Удаляем машину из списка победителей если она есть в списке победителей
        return this.removeCarWithWinner(carId);
      },
      // onNext
      () => {
        return this.garageStore.nextPage();
      },
      // onPrev
      () => {
        return this.garageStore.prevPage();
      },
      // onStartEngine
      (id: number) => {
        return this.engineStore.startEngine(id);
      },
      // onStopEngine
      (id: number) => {
        return this.engineStore.stopEngine(id);
      },
      // onSwitchEngineToDrive
      (id: number) => {
        return this.engineStore.switchEngineToDrive(id);
      },
      // onCarStopped
      (carId: number) => {
        this.stoppedRaceCars.add(carId);
      },
      // isRaceActive
      () => this.isRaceActive,
    );

    // Подписываемся на событие создание машины, после которого пересоздаётся весь GarageCars с новой машиной
    this.garageStore.subscribe(() => {
      garageCars.renderCars();
    });
  }

  // В зависимости от статуса гонки включаем/выключаем элементы кнопок
  private setRaceMode(
    isRaceActive: boolean,
    elementsForDisable: (HTMLButtonElement | HTMLInputElement)[],
  ) {
    this.isRaceActive = isRaceActive;
    this.isRaceActive
      ? elementsForDisable.forEach((element) => {
          element.disabled = true;
          element.classList.add("disabled");
        })
      : elementsForDisable.forEach((element) => {
          element.disabled = false;
          element.classList.remove("disabled");
        });
  }

  // Показываем pop-up с победителем
  private showWinner(parent: HTMLElement, winnerCar: Car, time: number) {
    const popUp = new ElementCreator("div", parent, "winner-popUp");
    popUp.setText(`${winnerCar.name} wins ${time}`);
    setTimeout(() => {
      popUp.removeElement();
    }, 3000);
  }

  // Метод проверка не устарела ли гонка, и нужно ли учитывать её результаты
  private isRaceOutdated(currentRaceId: number) {
    return currentRaceId !== this.raceId;
  }

  // -------------------------------------------------------------------------------------------------------
  // onRaceStart разбиваем на несколько методов для удобства

  // Старт двигателей
  private startCarsEngines(
    currentRaceId: number,
    garageCars: GarageCars,
  ): Promise<SafeStartEngineResponce[]> {
    // Запускаем двигатели всех машин
    return (
      this.engineStore
        .safeStartAllEngines(this.garageStore.cars)
        // Отсортировываем те машины, у которых завёлся двигатель
        .then((cars) => {
          // Проверяем активна ли гонка(или была нажата кнопка reset) и если нет
          // возвращаем пустой массив
          if (this.isRaceOutdated(currentRaceId)) {
            return [];
          }
          const startedCars = cars.filter((car) => {
            return car.isStarted === true;
          });
          // Для тех, у кого завёлся двигатель запускаем анимацию
          startedCars.forEach((car) => {
            garageCars.startCarAnimation(
              car.velocity,
              car.distance,
              garageCars.carState[car.carId],
            );
          });
          return startedCars;
        })
    );
  }
  // Переключение двигателей в режим езды
  private switchCarsEngines(
    startedCars: SafeStartEngineResponce[],
    currentRaceId: number,
    garageCars: GarageCars,
    garageControls: GarageControls,
  ) {
    // Флаг что победитель существует/не существует
    let hasWinner: boolean = false;
    // Создаём массив промисов с переключением двигателя в режим езды
    const promises = startedCars.map((car) => {
      return (
        this.engineStore
          .switchEngineToDrive(car.carId)
          .then(() => {
            // Проверяем активна ли гонка(или была нажата кнопка reset) и,
            // если нет возвращаем что машина не финишировала
            if (this.isRaceOutdated(currentRaceId)) {
              car.isFinished = false;
              return car;
            }
            // Проверяем есть ли машина в списке тех для кого нажали "B"(отмена гонки)
            if (this.stoppedRaceCars.has(car.carId)) {
              car.isFinished = false;
              return car;
            }
            // Если всё в порядке возвращаем машину с флагом "финишировала"
            car.isFinished = true;
            // Запускаем метод сохранения победителя если его ещё нет
            if (!hasWinner) {
              hasWinner = true;
              this.saveWinnerCar(
                car,
                garageCars,
                garageControls,
                currentRaceId,
              )?.then(() => {
                this.raceId += 1;
                // Гонка завершена
                this.setRaceMode(false, [
                  ...garageControls.raceLockedControls,
                  ...garageCars.paginationRaceLockedControls,
                  ...garageCars.carRaceLockedControls,
                ]);
              });
              return car;
            }
            return car;
          })
          // Если возвращается ошибка, то возвращаем машину с флагом "не финишировала"
          .catch(() => {
            car.isFinished = false;
            garageCars.stopCarAnimation(car.carId);
            return car;
          })
      );
    });
    return Promise.all(promises);
  }
  // Отправка победителя на сервер
  private saveWinnerCar(
    winner: SafeStartEngineResponce,
    garageCars: GarageCars,
    garageControls: GarageControls,
    currentRaceId: number,
  ) {
    // Проверяем активна ли гонка(или была нажата кнопка reset)
    if (this.isRaceOutdated(currentRaceId)) {
      return;
    }
    // Выбираем лучшую по времени машину из едущих
    return (
      this.winnersStore
        .getWinner(winner.carId)
        .then((winnerCar) => {
          // Если победитель существует то увеличиваем счётчик побед,
          // выбираем лучшее время заезда и отправляем это на сервер
          const wins = winnerCar.wins + 1;
          const time = Number(
            (winner.distance / winner.velocity / 1000).toFixed(1),
          );
          const bestTime = Math.min(winnerCar.time, time);
          const updatedWinnerCar = {
            id: winner.carId,
            wins: wins,
            time: bestTime,
          };
          // Ищем победителя среди машин для победного pop-up`а
          const winnerCarForPopUp = this.garageStore.cars.find(
            (item) => item.id === winner.carId,
          );
          // Запускаем анимацию с именем победителя
          if (winnerCarForPopUp) {
            this.showWinner(garageCars.carLimitParent, winnerCarForPopUp, time);
          }
          return this.winnersStore.updateWinner(updatedWinnerCar);
        })
        // Если победитель не существует, создаём его и отправляем на сервер
        .catch(() => {
          // Проверяем активна ли гонка(или была нажата кнопка reset)
          if (this.isRaceOutdated(currentRaceId)) {
            return;
          }
          const time = Number(
            (winner.distance / winner.velocity / 1000).toFixed(1),
          );
          const winnerCar: Winner = {
            id: winner.carId,
            wins: 1,
            time: time,
          };
          // Ищем победителя среди машин для победного pop-up`а
          const winnerCarForPopUp = this.garageStore.cars.find(
            (item) => item.id === winner.carId,
          );
          // Запускаем анимацию с именем победителя
          if (winnerCarForPopUp) {
            this.showWinner(garageCars.carLimitParent, winnerCarForPopUp, time);
          }
          return this.winnersStore.createWinner(winnerCar);
        })
    );
  }

  // Удаляем машину из победителей если машина удалена
  private removeCarWithWinner(carId: number) {
    return this.winnersStore
      .removeWinner(carId)
      .catch(() => {
        return;
      })
      .then(() => {
        return this.garageStore.removeCar(carId);
      });
  }
}
