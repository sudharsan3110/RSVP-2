import { CountryCode, getCountries, getCountryCallingCode } from 'libphonenumber-js';

const getCountryName = (countryCode: string): string => {
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return displayNames.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
};

const getCountryFlag = (countryCode: string): string => {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

export type PhoneNumberOption = {
  value: string;
  label: string;
  icon: string;
  countryCode: CountryCode;
};

export const generatePhoneNumberOptions = (): PhoneNumberOption[] => {
  const allCountries = getCountries();
  const options: PhoneNumberOption[] = [];

  for (const country of allCountries) {
    try {
      options.push({
        value: `+${getCountryCallingCode(country)}`,
        label: getCountryName(country),
        icon: getCountryFlag(country),
        countryCode: country,
      });
    } catch (error) {
      console.warn(`Failed to process country ${country}:`, error);
    }
  }

  return options.sort((a, b) => a.label.localeCompare(b.label));
};
