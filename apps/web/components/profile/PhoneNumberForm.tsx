import { useProfileUpdate } from '@/lib/react-query/user';
import { phoneNumberFormSchema, PhoneNumberFormType } from '@/lib/zod/profile';
import { User } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import FormProvider from '../ui/form-provider';
import ProfileSection from './ProfileSection';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { generatePhoneNumberOptions } from '@/lib/phone-utils';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

type Props = {
  user: User;
};

const PhoneNumberForm = ({ user }: Props) => {
  const { mutate, isPending } = useProfileUpdate();

  const phoneNumberOptions = useMemo(() => generatePhoneNumberOptions(), []);

  const [selectedCountry, setSelectedCountry] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>(user?.contact);
  const [open, setOpen] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const form = useForm<PhoneNumberFormType>({
    resolver: zodResolver(phoneNumberFormSchema(selectedCountry, phoneNumberOptions)),
    defaultValues: {
      contact: user?.contact,
    },
    mode: 'onTouched',
  });

  // Initialize form with user.contact
  useEffect(() => {
    if (user?.contact) {
      try {
        const parsed = parsePhoneNumberFromString(user.contact);
        if (parsed && parsed.isValid()) {
          setSelectedCountry(`+${parsed.countryCallingCode}`);
          setPhoneNumber(parsed.nationalNumber);
        } else {
          const parts = user.contact.split(' ');
          if (parts.length > 1) {
            setSelectedCountry(parts[0]);
            setPhoneNumber(parts.slice(1).join('').replace(/[^\d]/g, '')); // Clean non-digits
          } else {
            setSelectedCountry('+91');
            setPhoneNumber(user.contact.replace(/[^\d]/g, '')); // Clean non-digits
          }
        }
      } catch {
        const parts = user.contact.split(' ');
        if (parts.length > 1) {
          setSelectedCountry(parts[0]);
          setPhoneNumber(parts.slice(1).join('').replace(/[^\d]/g, '')); // Clean non-digits
        } else {
          setSelectedCountry('+91');
          setPhoneNumber(user.contact.replace(/[^\d]/g, '')); // Clean non-digits
        }
      }
      // Set initial form value
      form.reset({ contact: user.contact });
    }
  }, [user?.contact, form]);

  // Update form value when selectedCountry or phoneNumber changes
  useEffect(() => {
    const newContact = phoneNumber ? `${selectedCountry} ${phoneNumber}`.trim() : undefined;
    form.setValue('contact', newContact, { shouldValidate: true, shouldDirty: true });
    if (validationError) {
      setValidationError('');
    }
  }, [selectedCountry, phoneNumber, form, validationError]);

  const resetForm = () => {
    form.reset({ contact: user?.contact || undefined });
    setValidationError('');
    if (user?.contact) {
      try {
        const parsed = parsePhoneNumberFromString(user.contact);
        if (parsed && parsed.isValid()) {
          setSelectedCountry(`+${parsed.countryCallingCode}`);
          setPhoneNumber(parsed.nationalNumber);
        } else {
          const parts = user.contact.split(' ');
          if (parts.length > 1) {
            setSelectedCountry(parts[0]);
            setPhoneNumber(parts.slice(1).join('').replace(/[^\d]/g, '')); // Clean non-digits
          } else {
            setSelectedCountry('+91');
            setPhoneNumber(user.contact.replace(/[^\d]/g, '')); // Clean non-digits
          }
        }
      } catch {
        const parts = user.contact.split(' ');
        if (parts.length > 1) {
          setSelectedCountry(parts[0]);
          setPhoneNumber(parts.slice(1).join('').replace(/[^\d]/g, '')); // Clean non-digits
        } else {
          setSelectedCountry('+91');
          setPhoneNumber(user.contact.replace(/[^\d]/g, '')); // Clean non-digits
        }
      }
    } else {
      setSelectedCountry('+91');
      setPhoneNumber('');
    }
  };

  const onSubmit = async (data: PhoneNumberFormType) => {
    if (!data.contact || data.contact.trim() === '') {
      setValidationError('Phone number is required');
      return;
    }

    mutate(
      { contact: data.contact },
      {
        onSuccess: () => {
          form.reset({ contact: data.contact });
          setValidationError('');
        },
      }
    );
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^\d]/g, '');
    setPhoneNumber(value);
  };

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setOpen(false);
    form.trigger('contact');
  };

  const selectedOption =
    phoneNumberOptions.find((option) => option.value === selectedCountry) ||
    phoneNumberOptions.find((option) => option.value === '+91') ||
    phoneNumberOptions[0];

  return (
    <FormProvider methods={form} onSubmit={form.handleSubmit(onSubmit)}>
      <ProfileSection title="Phone Number" description="Invites will be sent to this phone number.">
        <div>
          <Label className="block text-sm font-medium mb-2" aria-label="phone number">
            Phone Number
          </Label>
          <div className="flex items-center gap-0">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    'justify-between rounded-r-none rounded-l-md border-none px-3 h-10 bg-muted',
                    'hover:transition-colors',
                    'focus:outline-none focus:ring-0',
                    'w-[140px]'
                  )}
                  type="button"
                >
                  <span className="flex items-center gap-2 text-sm truncate">
                    {selectedOption?.icon && <span>{selectedOption.icon}</span>}
                    <span>{selectedOption?.value}</span>
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-full min-w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
                sideOffset={4}
              >
                <Command>
                  <CommandInput placeholder="Search countries..." />
                  <CommandList>
                    <CommandEmpty>No countries found</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-auto">
                      {phoneNumberOptions.map((option) => (
                        <CommandItem
                          key={option.label}
                          value={`${option.label} ${option.value}`}
                          onSelect={() => handleCountrySelect(option.value)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedCountry === option.value ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {option.icon && <span className="mr-2">{option.icon}</span>}
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                          </div>
                          <span className="ml-auto text-muted-foreground text-sm">
                            {option.value}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Input
              type="text"
              placeholder="Enter phone number"
              className={cn(
                'rounded-l-none h-10 flex-1',
                (validationError || form.formState.errors.contact) && 'border-red-500'
              )}
              value={phoneNumber}
              onChange={handlePhoneChange}
              aria-label="Phone number input"
            />
          </div>

          {(validationError || form.formState.errors.contact) && (
            <p className="text-sm text-red-500 mt-1">
              {validationError || form.formState.errors.contact?.message}
            </p>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="reset"
            onClick={resetForm}
            variant="tertiary"
            radius="sm"
            disabled={!form.formState.isDirty}
          >
            Reset
          </Button>
          <Button type="submit" radius="sm" disabled={!form.formState.isDirty || isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </ProfileSection>
    </FormProvider>
  );
};

export default PhoneNumberForm;
