import React, { useState, useEffect, useCallback } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/Input";
import { Loading } from "@/components/ui/Loading";

/**
 * Enhanced SearchInput component with debounce, clear button, and icons.
 *
 * @param {string} value - Controlled value (optional)
 * @param {string} defaultValue - Default initial value
 * @param {function} onChange - Called immediately when input changes
 * @param {function} onSearch - Called when search is triggered (Enter key, Clear, or Debounce if debounce > 0)
 * @param {number} debounce - Debounce delay in ms (default: 0 for no debounce)
 * @param {string} placeholder - Placeholder text
 * @param {string} className - Additional CSS classes
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} autoFocus - Auto focus the input
 */
const SearchInput = ({
  value: controlledValue,
  defaultValue = "",
  onChange,
  onSearch,
  debounce = 0,
  placeholder = "Search...",
  className = "",
  loading = false,
  autoFocus = false,
  ...props
}) => {
  // Internal state for uncontrolled usage or intermediate debounce state
  const [internalValue, setInternalValue] = useState(
    controlledValue !== undefined ? controlledValue : defaultValue,
  );

  // Sync internal state with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  // Debounce logic
  useEffect(() => {
    if (debounce > 0 && onSearch) {
      const handler = setTimeout(() => {
        // Only trigger if value actually changed?
        // But we don't track 'prevValue' easily here without ref.
        // Simple approach: Trigger onSearch with current value.
        onSearch(internalValue);
      }, debounce);

      return () => clearTimeout(handler);
    }
  }, [internalValue, debounce]);

  // Handle Input Change
  const handleChange = (e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    if (onChange) {
      onChange(e); // Pass validation event or value
    }

    // If no debounce, trigger onSearch immediately (optional, or rely on parent using onChange)
    if (debounce === 0 && onSearch) {
      onSearch(newValue);
    }
  };

  // Handle Key Press (Enter)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) {
      // Force immediate search (bypass debounce if any)
      onSearch(internalValue);
    }
  };

  // Handle Clear
  const handleClear = () => {
    setInternalValue("");
    if (onChange) {
      // Create a synthetic event or just pass "" depending on expected signature
      // Standard Input expects event.
      const syntheticEvent = { target: { value: "" } };
      onChange(syntheticEvent);
    }
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
        {loading ? (
          <Loading size="xs" className="text-gray-400" />
        ) : (
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        )}
      </div>

      <Input
        type="text"
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pl-10 pr-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
        autoFocus={autoFocus}
        {...props}
      />

      {internalValue && (
        <button
          onClick={handleClear}
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none transition-colors"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
