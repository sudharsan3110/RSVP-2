import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { ChangeEventHandler } from 'react';

interface InputWithLabelProps {
  label: string;
  id: string;
  type: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

const InputWithLabel = ({ label, id, type, value, onChange }: InputWithLabelProps) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={id} className="text-sm text-white">
      {label}
    </Label>
    <Input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      className="rounded-[6px] border border-solid border-dark-500 bg-dark-900"
    />
  </div>
);

export default InputWithLabel;
