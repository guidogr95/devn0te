import LocalStorage from "devnote/core/local-storage";
import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue?: T): [T | null, (value: T | null) => void] {

	const [storedValue, setStoredValue] = useState<T | null>(() => {
		try {
			const item = LocalStorage.getItem<T>(key);
			return item
        ? item
        : initialValue || null;
		} catch (error) {
			console.log(error);
			return initialValue || null;
		}
	});

  useEffect(() => {
    const handleStorageChange = () => {
      const item = LocalStorage.getItem<T>(key);
      setStoredValue(item);
    };

    window.addEventListener("storageChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storageChanged", handleStorageChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetStoredValue = (value: T | null) => {
    setStoredValue(value);
    if (value === null) {
      LocalStorage.removeItem(key);
    } else {
      LocalStorage.setItem(key, storedValue, false);
    }
  };

	return [storedValue, handleSetStoredValue];
}
