import { WinnersStore } from "../../../state/winners.store";
import { ElementCreator } from "../../../utils/element-creator";
import carIcon from "../../../assets/icons/car.svg";
import { Button } from "../../components/base/button";

export class WinnersPage {
  private parent: HTMLElement;
  private winnersStore: WinnersStore;
  constructor(parent: HTMLElement) {
    this.parent = parent;
    this.winnersStore = new WinnersStore();
    this.init();
  }

  private init() {
    // После ответа и заполнения WinnersStore рендерим страницу победителей
    return this.winnersStore.init().then(() => {
      this.renderWinnerPage();
    });
  }

  private renderWinnerPage() {
    this.parent.replaceChildren();
    const garage = new ElementCreator("div", this.parent, "winners");
    //создаём заголовок с количеством машин
    const title = new ElementCreator(
      "h1",
      garage.getElement(),
      "garage__title",
    );
    // Заполняем общее число победителей
    title.setText(`Winners (${this.winnersStore.totalWinners})`);
    // Создаём заголовок с текущей страницей
    const subTitle = new ElementCreator(
      "h3",
      garage.getElement(),
      "winners__subTitle",
    );
    subTitle.setText(`Page #${this.winnersStore.currentPage}`);

    // Таблица победителей
    const winnersTable = new ElementCreator(
      "table",
      garage.getElement(),
      "winners-table",
    );
    // Заголовок таблицы победителей
    const winnersTableThead = new ElementCreator(
      "thead",
      winnersTable.getElement(),
      "winners-table__thead",
    );
    const winnersTableRow = new ElementCreator(
      "tr",
      winnersTableThead.getElement(),
      "winners-table__row",
    );
    const tableTheadNames = [
      "Number",
      "Car",
      "Name",
      "Wins",
      "Best time (seconds)",
    ];
    let isIdAsc = true;
    let isWinsAsc = true;
    let isTimeAsc = true;
    for (let i = 0; i < 5; i++) {
      const theadCell = new ElementCreator(
        "th",
        winnersTableRow.getElement(),
        "winners-table__tableHeader-cell",
        `winners-table__${tableTheadNames[i].replace(/ /g, "_").toLocaleLowerCase()}`,
      );
      theadCell.setText(tableTheadNames[i]);
      if (tableTheadNames[i] === "Number") {
        theadCell.addEvent("click", () => {
          isIdAsc
            ? this.winnersStore.init("id", "ASC").then(() => {
                this.fillWinnerTable(winnersTableBody.getElement());
              })
            : this.winnersStore.init("id", "DESC").then(() => {
                this.fillWinnerTable(winnersTableBody.getElement());
              });
          isIdAsc = !isIdAsc;
        });
      }
      if (tableTheadNames[i] === "Wins") {
        theadCell.addEvent("click", () => {
          isWinsAsc
            ? this.winnersStore.init("wins", "ASC").then(() => {
                this.fillWinnerTable(winnersTableBody.getElement());
              })
            : this.winnersStore.init("wins", "DESC").then(() => {
                this.fillWinnerTable(winnersTableBody.getElement());
              });
          isWinsAsc = !isWinsAsc;
        });
      }
      if (tableTheadNames[i] === "Best time (seconds)") {
        theadCell.addEvent("click", () => {
          isTimeAsc
            ? this.winnersStore.init("time", "ASC").then(() => {
                this.fillWinnerTable(winnersTableBody.getElement());
              })
            : this.winnersStore.init("time", "DESC").then(() => {
                this.fillWinnerTable(winnersTableBody.getElement());
              });
          isTimeAsc = !isTimeAsc;
        });
      }
    }
    // Тело таблицы победителей
    const winnersTableBody = new ElementCreator(
      "tbody",
      winnersTable.getElement(),
      "winners-table__body",
    );

    // -------------------------------------------------------------------------------------------------------
    this.fillWinnerTable(winnersTableBody.getElement());

    // Отрисовываем блок с кнопками next/prev
    const buttons = new ElementCreator(
      "div",
      garage.getElement(),
      "winner__pagination",
    );
    const prevButton = new Button(buttons.getElement(), "PREV", "set", () => {
      this.winnersStore.prevPage().then(() => {
        this.renderWinnerPage();
      });
    });
    const nextButton = new Button(buttons.getElement(), "NEXT", "set", () => {
      this.winnersStore.nextPage().then(() => {
        this.renderWinnerPage();
      });
    });
  }

  // -------------------------------------------------------------------------------------------------------
  private fillWinnerTable(parent: HTMLElement) {
    // Очищаем родителя
    parent.replaceChildren();
    // Заполняем заголовки страницы из winnersStore
    for (let i = 0; i < this.winnersStore.winnersCars.length; i++) {
      const bodyRow = new ElementCreator("tr", parent, "winners-table__row");
      // Заполняем строку с номером машины
      const winnerNumber = new ElementCreator(
        "td",
        bodyRow.getElement(),
        "winners-table__cell",
      );
      const winnerNumberValue =
        (this.winnersStore.currentPage - 1) * this.winnersStore.limit + i + 1;
      winnerNumber.setText(`${winnerNumberValue}`);
      // Заполняем строку с цветной иконкой машины
      const winnerCarCell = new ElementCreator(
        "td",
        bodyRow.getElement(),
        "winners-table__cell",
      );

      const winnerCarImage = new ElementCreator(
        "div",
        winnerCarCell.getElement(),
        "winners-table__car-image",
      );

      winnerCarImage.getElement().style.mask = `url(${carIcon}) no-repeat center / contain`;

      winnerCarImage.getElement().style.backgroundColor =
        this.winnersStore.winnersCars[i].color;
      // Заполняем строку с названием машины
      const winnerName = new ElementCreator(
        "td",
        bodyRow.getElement(),
        "winners-table__cell",
      );
      winnerName.setText(`${this.winnersStore.winnersCars[i].name}`);
      // Заполняем строку с количеством побед машины
      const winnerWins = new ElementCreator(
        "td",
        bodyRow.getElement(),
        "winners-table__cell",
      );
      winnerWins.setText(`${this.winnersStore.winnersCars[i].wins}`);
      // Заполняем строку с лучшим временем машины
      const winnerBestTime = new ElementCreator(
        "td",
        bodyRow.getElement(),
        "winners-table__cell",
      );
      winnerBestTime.setText(`${this.winnersStore.winnersCars[i].bestTime}`);
    }
  }
}
