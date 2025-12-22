import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, X } from "lucide-react";

/**
 * A flexible Combobox component that allows:
 * 1. Searching/Filtering options
 * 2. Selecting an existing option
 * 3. Entering a custom value (Creatable)
 *
 * @param {Array} options - Array of objects { label, value } or strings
 * @param {String} value - Current value
 * @param {Function} onChange - Callback when value changes
 * @param {String} placeholder - Placeholder text
 * @param {Boolean} freeSolo - If true, allows entering custom values not in options
 * @param {String} className - Custom classes
 */
const Combobox = ({
  options = [],
  value,
  onChange,
  placeholder = "Select or type...",
  freeSolo = true,
  className = "",
  disabled = false,
  error = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const contentRef = useRef(null);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);

  // Normalize options to { label, value } format
  const normalizedOptions = options.map((opt) =>
    typeof opt === "object"
      ? opt
      : { label: opt?.toString(), value: opt?.toString() }
  );

  // Sync internal query with external value if it matches an option or if freeSolo
  useEffect(() => {
    if (value) {
      const match = normalizedOptions.find((opt) => opt.value === value);
      if (match) {
        setQuery(match.label);
      } else if (freeSolo) {
        setQuery(value);
      }
    } else {
      setQuery("");
    }
  }, [value, freeSolo]); // Remove normalizedOptions from dependency to prevent loop

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target) &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        // If closed, ensure query matches the actually selected value or reset it if invalid
        if (value) {
          const match = normalizedOptions.find((opt) => opt.value === value);
          if (match) setQuery(match.label);
          else if (freeSolo) setQuery(value);
          else setQuery("");
        } else {
          setQuery("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, freeSolo, normalizedOptions]);

  const filteredOptions =
    query === ""
      ? normalizedOptions
      : normalizedOptions.filter((opt) =>
          opt.label.toLowerCase().includes(query.toLowerCase())
        );

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);

    // Find label for display
    const match = normalizedOptions.find((o) => o.value === optionValue);
    if (match) setQuery(match.label);
    else if (freeSolo) setQuery(optionValue);
  };

  const handleInputChange = (e) => {
    const newVal = e.target.value;
    setQuery(newVal);
    setIsOpen(true);

    // If freeSolo, we update the parent immediately OR wait for selection/blur?
    // User expects "typing" to fill the form.
    if (freeSolo) {
      onChange(newVal);
    }
  };

  const handleInputFocus = () => {
    if (!disabled) setIsOpen(true);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={triggerRef}
        className={`flex items-center w-full rounded-md border ${
          error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
        } bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500`}
      >
        <input
          ref={inputRef}
          type="text"
          className="w-full px-3 py-2 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none disabled:opacity-50"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={disabled}
        />
        <div className="flex items-center pr-2 gap-1">
          {query && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect("");
                setQuery("");
                if (inputRef.current) inputRef.current.focus();
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Dropdown Content */}
      {isOpen && !disabled && (
        <div
          ref={contentRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredOptions.length > 0 ? (
            <ul className="py-1">
              {filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                    value === opt.value
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <span>{opt.label}</span>
                  {value === opt.value && <Check className="h-4 w-4" />}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              {freeSolo ? (
                <div
                  onClick={() => handleSelect(query)}
                  className="flex items-center gap-2 cursor-pointer hover:text-primary-600"
                >
                  <Plus className="h-4 w-4" />
                  <span>create "{query}"</span>
                </div>
              ) : (
                "No options found"
              )}
            </div>
          )}
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Combobox;
