import * as React from 'react';

import { cn } from '@/lib/utils';
import { fieldClassName } from './input';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: string[];
  disabledOptions?: string[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, id, name, options, disabledOptions, ...props }, ref) => {
    return (
      <select
        className={cn(fieldClassName, className)}
        name={name}
        id={id}
        ref={ref}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            disabled={disabledOptions?.includes(option)}
          >
            {option}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = 'Select';

export { Select };
