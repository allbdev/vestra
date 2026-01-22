import { storageKeys } from "./consts";

export function getStorageItem(key: keyof typeof storageKeys) {
  return localStorage.getItem(storageKeys[key]);
}

export function setStorageItem(key: keyof typeof storageKeys, value: string) {
  localStorage.setItem(storageKeys[key], value);
}

export function removeStorageItem(key: keyof typeof storageKeys) {
  localStorage.removeItem(storageKeys[key]);
}