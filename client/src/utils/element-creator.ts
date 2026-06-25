import { eventType } from "../types/utils.types";

// K - один из ключей HTMLElementTagNameMap
export class ElementCreator<K extends keyof HTMLElementTagNameMap> {
  // element - DOM-элемент, чей тип определяется тегом K через HTMLElementTagNameMap[K]
  private element: HTMLElementTagNameMap[K];
  constructor(tagName: K, parent: HTMLElement, ...classes: string[]) {
    this.element = document.createElement(tagName);
    parent.appendChild(this.element);

    this.addClasses(...classes);
  }

  public addClasses(...classes: string[]): void {
    classes.forEach((classForElement) => {
      this.element.classList.add(classForElement);
    });
  }

  public removeClasses(...classes: string[]): void {
    classes.forEach((classForElement) => {
      this.element.classList.remove(classForElement);
    });
  }

  public setText(text: string): void {
    this.element.textContent = text;
  }

  public setInputType(value: string): void {
    if (this.element instanceof HTMLInputElement) {
      this.element.type = value;
    }
  }

  public addEvent(eventType: eventType, handler: (event: Event) => void): void {
    this.element.addEventListener(eventType, handler);
  }

  // Возвращаем элемент типа соответствующему ключу из HTMLElementTagNameMap
  public getElement(): HTMLElementTagNameMap[K] {
    return this.element;
  }

  // Удаляем элемент
  public removeElement() {
    this.element.remove();
  }
}
