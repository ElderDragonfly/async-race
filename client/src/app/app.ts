import { ElementCreator } from "../utils/element-creator";
import { Navigation } from "../ui/pages/navigation/navigation";
import { GaragePage } from "../ui/pages/garage/garage-page";
import { WinnersPage } from "../ui/pages/winners/winners-page";

export class App {
  constructor() {
    this.init();
  }

  private init() {
    // Создаём контейнер всего приложения
    const appContainer = new ElementCreator("div", document.body, "app");
    // Создаём кнопки навигации
    const navigation = new Navigation(appContainer.getElement());
    const page = new ElementCreator(
      "div",
      appContainer.getElement(),
      "app__page",
    );

    // Определяем, что будет отрисовываться при изменении хэша
    const renderPage = (): void => {
      page.getElement().replaceChildren();

      if (location.hash === "#/garage") {
        new GaragePage(page.getElement());
      } else if (location.hash === "#/winners") {
        new WinnersPage(page.getElement());
      }
    };

    // Вешаем слушатель на изменение хэша
    window.addEventListener("hashchange", renderPage);

    // При пустом хэше добавляем garage и всегда генерируем страницу garage
    if (location.hash === "") {
      location.hash = "#/garage";
    } else renderPage();
  }
}
