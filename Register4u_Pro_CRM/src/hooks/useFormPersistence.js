import { useEffect } from "react";

/**
 * Custom hook to persist react-hook-form data to sessionStorage.
 * @param {string} key - Unique key for sessionStorage (e.g., 'add_visitor_form')
 * @param {Function} watch - react-hook-form watch function
 * @param {Function} setValue - react-hook-form setValue function
 * @param {Object} defaultValues - Optional default values to merge/fallback
 */
const useFormPersistence = (key, watch, setValue, defaultValues = {}) => {
  // Load saved data on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem(key);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // exclude files or non-serializable data if any check needed
        Object.keys(parsedData).forEach((field) => {
          // We avoid overwriting if the field is a fileList (which won't be in storage anyway)
          setValue(field, parsedData[field]);
        });
      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
    }
  }, [key, setValue]);

  // Save data on change
  useEffect(() => {
    const subscription = watch((value) => {
      // Filter out files because they can't be stringified
      const storageValue = {};
      Object.keys(value).forEach((k) => {
        const val = value[k];
        // Check if it's a file list or blob
        if (
          val instanceof FileList ||
          val instanceof File ||
          val instanceof Blob
        ) {
          return;
        }
        // Also check arrays of files (common in file inputs)
        if (
          Array.isArray(val) &&
          val.length > 0 &&
          (val[0] instanceof File || val[0] instanceof Blob)
        ) {
          return;
        }
        storageValue[k] = val;
      });

      sessionStorage.setItem(key, JSON.stringify(storageValue));
    });
    return () => subscription.unsubscribe();
  }, [watch, key]);

  const clearPersistedData = () => {
    sessionStorage.removeItem(key);
  };

  return { clearPersistedData };
};

export default useFormPersistence;
