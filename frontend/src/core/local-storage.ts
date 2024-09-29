class LocalStorage {

  static setItem<T>(key: string, value: T, isNotify = true): void {
    localStorage.setItem(key, JSON.stringify(value));
    if (!isNotify) return;
    this.afterItemChanged();
  }

  static getItem<T>(key: string) {
    const item = localStorage.getItem(key);
    if (!item) {
      return null;
    }
    return JSON.parse(item) as T;
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
    this.afterItemChanged();
  }

  static afterItemChanged(): void {
    const event = new Event("storageChanged");
    window.dispatchEvent(event);
  }
}

export default LocalStorage;
