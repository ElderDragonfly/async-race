import { Page } from "../types/utils.types";
import { HttpError } from "../utils/http.error";

const BASE_URL = "http://127.0.0.1:3000";

export function httpRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  return fetch(BASE_URL + path, options).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new HttpError(response.status, response.statusText);
    }
  });
}

export function httpRequestWithTotal<T>(path: string): Promise<Page<T>> {
  return fetch(BASE_URL + path).then((response) => {
    if (response.ok) {
      const totalString = response.headers.get("X-Total-Count");
      let total: number;
      if (totalString) {
        total = parseInt(totalString);
      } else {
        total = 0;
      }
      return response.json().then((items) => {
        return { items, total };
      });
    } else {
      throw new Error("response не ok");
    }
  });
}
