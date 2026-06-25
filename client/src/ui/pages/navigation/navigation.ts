import { ElementCreator } from "../../../utils/element-creator";
import { Button } from "../../components/base/button";

export class Navigation {
  private parent: HTMLElement;
  constructor(parent: HTMLElement) {
    this.parent = parent;
    this.init();
  }

  private init() {
    const appNavigation = new ElementCreator(
      "div",
      this.parent,
      "app__navigation",
    );

    new Button(appNavigation.getElement(), "TO GARAGE", "switch", () => {
      if (location.hash === "#/winners") location.hash = "#/garage";
    });
    new Button(appNavigation.getElement(), "TO WINNERS", "switch", () => {
      if (location.hash === "#/garage") location.hash = "#/winners";
    });
  }
}
