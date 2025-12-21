import React from 'react';
import { cn } from '../../lib/utils';

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  const handleChange = (e) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <input
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-primary-600',
        className
      )}
      ref={ref}
      checked={checked}
      onChange={handleChange}
      {...props}
    />
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };
