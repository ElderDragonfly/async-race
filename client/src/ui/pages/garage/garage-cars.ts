import { GarageStore } from "../../../state/garage.store";
import { ElementCreator } from "../../../utils/element-creator";
import { Button } from "../../components/base/button";
import carIcon from "../../../assets/icons/car.svg";
import {
  StartEngineResponse,
  DriveEngineResponse,
} from "../../../types/engine.types";
import { HttpError } from "../../../utils/http.error";
import { RaceCarState } from "../../../types/car.types";

export class GarageCars {
  private garageStore: GarageStore;
  // События по клику
  private onSelect: (carId: number) => Promise<void>;
  private onRemove: (carId: number) => Promise<void>;
  private onNext: () => Promise<void>;
  private onPrev: () => Promise<void>;
  private onStartEngine: (id: number) => Promise<StartEngineResponse>;
  private onStopEngine: (id: number) => Promise<StartEngineResponse>;
  private onSwitchEngineToDrive: (id: number) => Promise<DriveEngineResponse>;
  private onCarStopped: (carId: number) => void;
  // Родитель для блока с машинами
  public carLimitParent!: HTMLElement;
  private title?: ElementCreator<"h1">;
  private subTitle?: ElementCreator<"h3">;
  // Id анимации
  private carAnimationIds: number[] = [];
  // Массив с запусками машин
  public startActions: (() => void)[] = [];
  // Массив с остановками машин
  public stopActions: (() => void)[] = [];
  // Объект с элементами машин и трэков
  public carState: Record<number, RaceCarState> = {};
  // Блок с кнопками переключения prev/next чтобы его выключать/включать при гонке
  public paginationRaceLockedControls: HTMLButtonElement[] = [];
  // Блок с кнопками переключения prev/next чтобы его выключать/включать при гонке
  public carRaceLockedControls: HTMLButtonElement[] = [];
  // Поле активности гонки
  private isRaceActive: () => boolean;
  constructor(
    // Родитель для всех элементов
    parent: HTMLElement,
    garageStore: GarageStore,
    onSelect: (carId: number) => Promise<void>,
    onRemove: (carId: number) => Promise<void>,
    onNext: () => Promise<void>,
    onPrev: () => Promise<void>,
    onStartEngine: (id: number) => Promise<StartEngineResponse>,
    onStopEngine: (id: number) => Promise<StartEngineResponse>,
    onSwitchEngineToDrive: (id: number) => Promise<DriveEngineResponse>,
    onCarStopped: (carId: number) => void,
    isRaceActive: () => boolean,
  ) {
    this.onSelect = onSelect;
    this.onRemove = onRemove;
    this.onNext = onNext;
    this.onPrev = onPrev;
    this.onStartEngine = onStartEngine;
    this.onStopEngine = onStopEngine;
    this.onSwitchEngineToDrive = onSwitchEngineToDrive;
    this.onCarStopped = onCarStopped;
    this.isRaceActive = isRaceActive;
    this.garageStore = garageStore;
    this.init(parent);
  }

  private init(parent: HTMLElement) {
    //создаём заголовок с количеством машин
    this.title = new ElementCreator("h1", parent, "garage__title");
    this.title.setText(`Garage (${this.garageStore.totalCars})`);
    // Создаём заголовок с текущей страницей
    this.subTitle = new ElementCreator("h3", parent, "garage__subTitle");
    this.subTitle.setText(`Page #${this.garageStore.currentPage}`);
    // Отрисовывается блок с машинами из garageStore
    const garageCars = new ElementCreator("div", parent, "garage__cars-limit");
    this.carLimitParent = garageCars.getElement();
    this.renderCars();
    // Создаём и отрисовываем блок с кнопками next/prev
    const buttons = new ElementCreator("div", parent, "garage__pagination");
    const prevButton = new Button(buttons.getElement(), "PREV", "set", () => {
      this.onPrev();
    });
    this.paginationRaceLockedControls.push(prevButton.getElement());
    const nextButton = new Button(buttons.getElement(), "NEXT", "set", () => {
      this.onNext();
    });
    this.paginationRaceLockedControls.push(nextButton.getElement());
  }

  // Отрисовывается блок с машинами из garageStore
  public renderCars() {
    // Меняем число машин
    if (this.title)
      this.title.setText(`Garage (${this.garageStore.totalCars})`);
    // Меняем текущую страницу
    if (this.subTitle)
      this.subTitle.setText(` Page #${this.garageStore.currentPage}`);
    // Если нет элемента-родителя, выходим из функции
    if (!this.carLimitParent) return;
    const parent = this.carLimitParent;
    // Очищаем содержимое родителя
    parent.replaceChildren();
    // Очищаем массивы с данными машин от прошлой отрисовки
    this.carAnimationIds.length = 0;
    this.startActions.length = 0;
    this.stopActions.length = 0;
    this.carState = {};
    // Очищаем массив с элементами машин
    this.carRaceLockedControls = [];
    // Для каждой машины отрисовываем блок с машиной, кнопками, названием
    this.garageStore.cars.forEach((carItem) => {
      const car = new ElementCreator("div", parent, "garage__car", "car");
      const carSettings = new ElementCreator(
        "div",
        car.getElement(),
        "car__settings",
      );

      // Блок с кнопками установок машины и названием
      const selectButton = new Button(
        carSettings.getElement(),
        "SELECT",
        "set",
        () => {
          this.onSelect(carItem.id);
        },
      );
      this.carRaceLockedControls.push(selectButton.getElement());
      const removeButton = new Button(
        carSettings.getElement(),
        "REMOVE",
        "set",
        () => {
          this.onRemove(carItem.id);
        },
      );
      this.carRaceLockedControls.push(removeButton.getElement());
      const carTitle = new ElementCreator(
        "h3",
        carSettings.getElement(),
        "car__title",
      );
      carTitle.setText(`${carItem.name}`);

      // Блок с кнопками управления двигателем машины и машиной
      const carControls = new ElementCreator(
        "div",
        car.getElement(),
        "car__controls",
      );
      const carEngine = new ElementCreator(
        "div",
        carControls.getElement(),
        "car__engine",
      );
      // Элемент финишного флага
      const finishFlag = new ElementCreator(
        "div",
        carControls.getElement(),
        "finish-flag",
      );
      // Функция старта машины
      const startAction = () => {
        return this.startCar(this.carState[carItem.id]);
      };
      // Сохраняем в массив для вызова общей гонки
      this.startActions.push(startAction);
      // Кнопка старта машины
      const engineStartButton = new Button(
        carEngine.getElement(),
        "A",
        "switch",
        () => {
          // Запускаем  анимацию и двигатель машины
          startAction().finally(() => {
            this.setStartCarControlDisable(
              false,
              engineStartButton.getElement(),
            );
          });
          // Дезактивируем кнопку запуска этой машины
          this.setStartCarControlDisable(true, engineStartButton.getElement());
        },
      );
      this.carRaceLockedControls.push(engineStartButton.getElement());
      // Функция остановки машины
      const stopAction = () => {
        this.stopCar(this.carState[carItem.id]);
      };
      // Сохраняем в массив для вызова общей остановки
      this.stopActions.push(stopAction);
      const engineStopButton = new Button(
        carEngine.getElement(),
        "B",
        "switch",
        () => {
          // Останавливаем анимацию и возвращаем машинку визуально на старт
          stopAction();
          // Активируем кнопку запуска этой машины
          this.setStartCarControlDisable(false, engineStartButton.getElement());
          // Добавляем машину в массив для исключения из общей гонки
          this.onCarStopped(carItem.id);
        },
      );
      const carTrack = new ElementCreator(
        "div",
        carEngine.getElement(),
        "car__track",
      );
      // Иконка автомобиля
      const carImage = new ElementCreator(
        "div",
        carTrack.getElement(),
        "car__image",
      );
      // Красим машинку
      carImage.getElement().style.backgroundColor = carItem.color;
      carImage.getElement().style.mask = `url(${carIcon}) no-repeat center / contain`;
      carImage.getElement().style.webkitMask = `url(${carIcon}) no-repeat center / contain`;

      // Добавляем машину в объект с элементами
      this.carState[carItem.id] = {
        carId: carItem.id,
        carElement: carImage.getElement(),
        trackElement: carTrack.getElement(),
      };
    });
  }
  // -------------------------------------------------------------------------------------------------------
  // Функция старта анимации одной машины, можно в будущем вынести в отдельный файл
  public startCarAnimation(
    velocity: number,
    distance: number,
    carState: RaceCarState,
  ) {
    let startTime: number;
    const totalTime = distance / velocity;

    // Дистанция от сервера возвращается в пунктах, определяем дистанцию с которой будем работать в пикселях
    const trackWidth = carState.trackElement.clientWidth;
    const carWidth = carState.carElement.clientWidth;
    const animationDistancePx = trackWidth - carWidth;

    const animateCar = (currentTime: number) => {
      // Если анимация не началась, текущее время становится началом анимации
      if (!startTime) startTime = currentTime;

      // Считаем прошедшее время с начала анимации
      const elapsed = currentTime - startTime;

      // Процент пройденного пути прошло времени / общее время в пути
      const progress = elapsed / totalTime;

      // Если прогресс больше или равен 100% останавливаем машину и отправляем запрос на остановку двигателя
      if (progress >= 1) {
        this.onStopEngine(carState.carId);
        return;
      }

      const position = progress * animationDistancePx;
      carState.carElement.style.transform = `translateX(${position}px)`;

      this.carAnimationIds[carState.carId] = requestAnimationFrame(animateCar);
    };

    this.carAnimationIds[carState.carId] = requestAnimationFrame(animateCar);
  }
  // Метод остановки анимации одной машины
  public stopCarAnimation(carId: number) {
    cancelAnimationFrame(this.carAnimationIds[carId]);
  }
  // -------------------------------------------------------------------------------------------------------

  // Метод запуска одной машины
  private startCar(carState: RaceCarState) {
    return this.onStartEngine(carState.carId)
      .then((data) => {
        // После успешного запуска запускаем анимацию машины и меняем статус двигателя на drive
        this.startCarAnimation(data.velocity, data.distance, carState);

        return this.onSwitchEngineToDrive(carState.carId);
      })
      .catch((error) => {
        return this.handleEngineError(
          error,
          this.carAnimationIds[carState.carId],
        );
      });
  }
  // Метод остановки одной машины
  public stopCar(carState: RaceCarState): Promise<StartEngineResponse> {
    cancelAnimationFrame(this.carAnimationIds[carState.carId]);
    carState.carElement.style.transform = `translateX(0px)`;
    // Останавливаем двигатель
    return this.onStopEngine(carState.carId);
  }

  // -------------------------------------------------------------------------------------------------------

  // Метод обработки ошибки работы двигателя машины
  private handleEngineError(error: HttpError, animationFrameId: number) {
    cancelAnimationFrame(animationFrameId);
  }

  // -------------------------------------------------------------------------------------------------------

  private setStartCarControlDisable(
    isStarted: boolean,
    element: HTMLButtonElement,
  ) {
    if (isStarted) {
      element.disabled = true;
      element.classList.add("disabled");
    }
    if (!isStarted && !this.isRaceActive) {
      element.disabled = false;
      element.classList.remove("disabled");
    }
  }
}
