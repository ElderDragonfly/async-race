import { ElementCreator } from "../../../utils/element-creator";

export class Button {
  private element!: HTMLButtonElement;
  private parent: HTMLElement;
  private text: string;
  private buttonModifire: "set" | "switch";
  private handler?: () => void;
  constructor(
    parent: HTMLElement,
    text: string,
    modifire: "set" | "switch",
    handler?: () => void,
  ) {
    this.parent = parent;
    this.text = text;
    this.buttonModifire = modifire;
    this.handler = handler;
    this.init();
  }

  private init() {
    const button = new ElementCreator(
      "button",
      this.parent,
      "button",
      `button--${this.buttonModifire}`,
    );
    this.element = button.getElement();
    button.setText(this.text);
    if (this.handler) {
      button.addEvent("click", this.handler);
    }
  }

  public getElement() {
    return this.element;
  }
}
