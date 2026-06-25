import { ElementCreator } from "../../../utils/element-creator";
import { Button } from "../../components/base/button";
import { Car, NewCar, UpdateCar } from "../../../types/car.types";
import {
  SafeStartEngineResponce,
  StartEngineResponse,
} from "../../../types/engine.types";
import { randomCars } from "../../../utils/randomCars";

export class GarageControls {
  private onCreate: (car: NewCar) => void;
  private onUpdate: (car: UpdateCar) => void;
  private onGenerateCars: (cars: NewCar[]) => Promise<void>;
  private onRaceStart: () => void;
  private onRaceStop: () => Promise<StartEngineResponse[]>;
  private updateBlock?: HTMLDivElement;
  private createInputName?: HTMLInputElement;
  private createInputColor?: HTMLInputElement;
  private updateInputName?: HTMLInputElement;
  private updateInputColor?: HTMLInputElement;
  // Элементы, которые нужно отключать/включать при RACE
  public raceLockedControls: (HTMLButtonElement | HTMLInputElement)[] = [];
  constructor(
    parent: HTMLElement,
    onCreate: (car: NewCar) => void,
    onUpdate: (car: UpdateCar) => void,
    onGenerateCars: (cars: NewCar[]) => Promise<void>,
    onRaceStart: () => void,
    onRaceStop: () => Promise<StartEngineResponse[]>,
  ) {
    this.onCreate = onCreate;
    this.onUpdate = onUpdate;
    this.onGenerateCars = onGenerateCars;
    this.onRaceStart = onRaceStart;
    this.onRaceStop = onRaceStop;
    this.init(parent);
  }

  private init(parent: HTMLElement) {
    const garageControls = new ElementCreator(
      "div",
      parent,
      "garage__controls",
    );

    // -------------------------------------------------------------------------------------------------------
    // БЛОК СОЗДАНИЯ МАШИНЫ
    const garageCreate = new ElementCreator(
      "div",
      garageControls.getElement(),
      "garage__form",
      "garage__form--create",
    );
    // Поле ввода имени
    const createInputName = new ElementCreator(
      "input",
      garageCreate.getElement(),
      "garage__input",
      "garage__input--name",
    );
    this.createInputName = createInputName.getElement();
    this.raceLockedControls.push(createInputName.getElement());
    // Поле ввода цвета
    const createInputColor = new ElementCreator(
      "input",
      garageCreate.getElement(),
      "garage__input",
      "garage__input--color",
    );
    this.createInputColor = createInputColor.getElement();
    createInputColor.setInputType("color");
    this.raceLockedControls.push(createInputColor.getElement());
    // Кнопка создания
    const createButton = new Button(
      garageCreate.getElement(),
      "CREATE",
      "set",
      () => {
        this.onCreate({
          name: createInputName.getElement().value,
          color: createInputColor.getElement().value,
        });
        this.clearCreateFields();
      },
    );
    this.raceLockedControls.push(createButton.getElement());

    // -------------------------------------------------------------------------------------------------------
    // БЛОК ОБНОВЛЕНИЯ МАШИНЫ
    const garageUpdate = new ElementCreator(
      "div",
      garageControls.getElement(),
      "garage__form",
      "garage__form--update",
      "disabled-update",
    );
    this.updateBlock = garageUpdate.getElement();
    // Поле ввода имени
    const updateInputName = new ElementCreator(
      "input",
      garageUpdate.getElement(),
      "garage__input",
      "garage__input--name",
    );
    this.updateInputName = updateInputName.getElement();
    this.raceLockedControls.push(updateInputName.getElement());
    // Поле ввода цвета
    const updateInputColor = new ElementCreator(
      "input",
      garageUpdate.getElement(),
      "garage__input",
      "garage__input--color",
    );
    updateInputColor.setInputType("color");
    this.updateInputColor = updateInputColor.getElement();
    this.raceLockedControls.push(updateInputColor.getElement());
    // Кнопка обновления
    const updateButton = new Button(
      garageUpdate.getElement(),
      "UPDATE",
      "set",
      () => {
        this.onUpdate({
          name: updateInputName.getElement().value,
          color: updateInputColor.getElement().value,
        });
        this.clearUpdateFields();
      },
    );
    this.raceLockedControls.push(updateButton.getElement());

    // -------------------------------------------------------------------------------------------------------
    // Блок начала и сброса общей гонки, создания 100 машин
    const garageActions = new ElementCreator(
      "div",
      garageControls.getElement(),
      "garage__actions",
    );
    // Кнопка старта общей гонки
    const raceStart = new Button(
      garageActions.getElement(),
      "RACE",
      "switch",
      () => {
        this.onRaceStart();
      },
    );
    this.raceLockedControls.push(raceStart.getElement());
    const raceReset = new Button(
      garageActions.getElement(),
      "RESET",
      "switch",
      () => {
        this.onRaceStop();
      },
    );

    const generateCars = new Button(
      garageActions.getElement(),
      "GENERATE CARS",
      "set",
      () => {
        this.onGenerateCars(randomCars());
      },
    );
    this.raceLockedControls.push(generateCars.getElement());
  }

  // -------------------------------------------------------------------------------------------------------
  // Заполнение полей выбранной машины
  public setSelectedCar(car?: Car) {
    if (this.updateInputName && this.updateInputColor) {
      this.updateInputName.value = car?.name || "";
      this.updateInputColor.value = car?.color || "#000";
    }
    // При выборе или сбросе выбора машины добавляется или убирается disabled соответственно
    if (this.updateBlock) {
      if (car) this.updateBlock.classList.remove("disabled-update");
      else this.updateBlock.classList.add("disabled-update");
    }
  }

  // Очищаем поля создания машины
  public clearCreateFields() {
    if (this.createInputName && this.createInputColor) {
      this.createInputName.value = "";
      this.createInputColor.value = "#000000";
    }
  }

  // Очищаем поля изменения машины
  public clearUpdateFields() {
    if (this.updateInputName && this.updateInputColor) {
      this.updateInputName.value = "";
      this.updateInputColor.value = "#000000";
    }
  }
  // -------------------------------------------------------------------------------------------------------
}
