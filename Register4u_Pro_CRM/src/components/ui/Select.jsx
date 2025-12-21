import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const Select = ({ children, value, onValueChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const selectRef = useRef(null);

  useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className="relative" {...props}>
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen,
            selectedValue,
          });
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, {
            isOpen,
            onValueChange: handleValueChange,
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = ({
  children,
  isOpen,
  setIsOpen,
  selectedValue,
  displayValue,
  className = "",
  ...props
}) => {
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 ${className}`}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      <span className="text-left">
        {displayValue || selectedValue || children}
      </span>
      <ChevronDown
        className={`h-4 w-4 transition-transform text-gray-500 dark:text-gray-400 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
  );
};

const SelectValue = ({ placeholder, ...props }) => {
  return <span {...props}>{placeholder}</span>;
};

const SelectContent = ({
  children,
  isOpen,
  onValueChange,
  className = "",
  ...props
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg dark:shadow-gray-900/50 max-h-60 overflow-auto ${className}`}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (child.type === SelectItem) {
          return React.cloneElement(child, {
            onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectItem = ({
  children,
  value,
  onValueChange,
  className = "",
  ...props
}) => {
  return (
    <button
      type="button"
      className={`w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none ${className}`}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
