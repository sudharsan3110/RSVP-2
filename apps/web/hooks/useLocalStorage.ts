import { useState,useEffect } from "react";
import { LOCALSTORAGE_KEY, LOCALSTORAGE_EXPIRY_KEY, EXPIRY_MINUTES } from "@/utils/constants";
import { DefaultValues } from "react-hook-form";

interface FormInterface<T = any> {
  defaultValues: DefaultValues<T>;
}
export const clearLocalStorage = () => {
  window.localStorage.removeItem(LOCALSTORAGE_KEY);
  window.localStorage.removeItem(LOCALSTORAGE_EXPIRY_KEY);
};
export const useLocalStorage = <T = any>({ defaultValues }: FormInterface<T>) => {
  const [hasLocalStorage, setHasLocalStorageData] = useState(false)

useEffect(() => {
    const saved = window.localStorage.getItem(LOCALSTORAGE_KEY);
    const expiry = window.localStorage.getItem(LOCALSTORAGE_EXPIRY_KEY);

    if (saved && expiry) {
      const now = Date.now();
      if (now < Number(expiry)) {
        try {
          const data = JSON.parse(saved);
          const isValid = Object.keys(data).some(
            (key) => data[key] && data[key] !== ''
          );
          setHasLocalStorageData(isValid);
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
        }
      } else {
        clearLocalStorage();
      }
    }
  }, []);


  
  const setLocalStorage = (value: any) => {
    window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify({ ...value }));
    window.localStorage.setItem(
      LOCALSTORAGE_EXPIRY_KEY,
      (Date.now() + EXPIRY_MINUTES * 60 * 1000).toString()
    );
  };
  const setFormData = (reset: any) => {
    const saved = window.localStorage.getItem(LOCALSTORAGE_KEY);
    const expiry = window.localStorage.getItem(LOCALSTORAGE_EXPIRY_KEY);
    if (saved && expiry) {
      const now = Date.now();
      if (now < Number(expiry)) {
        try {
          const data = JSON.parse(saved);
          reset({ ...defaultValues, ...data }, { keepDirty: false });
          if (Object.keys(data).some(key => data[key] && data[key] !== '')) {
            setHasLocalStorageData(true);
          }
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
        }
      } else {
        clearLocalStorage();
      }
    }
  };

 

  return { hasLocalStorage, setFormData, setLocalStorage };
};


