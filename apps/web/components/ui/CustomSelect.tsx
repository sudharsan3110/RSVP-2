import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  placeholder?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
  className?: string;
  ariaLabel?: string;
}

export default function CustomSelect({
  options,
  value,
  placeholder = 'Select an option',
  defaultValue,
  onValueChange,
  className = 'w-[90vw] hover:rounded-[8px] md:w-[200px]',
  ariaLabel,
}: CustomSelectProps) {
  return (
    <Select defaultValue={defaultValue} value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn('w-[90vw] hover:rounded-[8px] md:w-[200px]', className)}
        aria-label={ariaLabel}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              className="cursor-pointer hover:rounded-[8px]"
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
