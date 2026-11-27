import { getCountryCallingCode } from 'libphonenumber-js/min';
import { AT, BE, BG, CY, CZ, DE, DK, EE, ES, FI, FR, GR, HR, HU, IE, IT, LT, LU, LV, MT, NL, PL, PT, RO, SE, SI, SK } from 'country-flag-icons/react/3x2';

export const phoneFlags = { AT, BE, BG, CY, CZ, DE, DK, EE, ES, FI, FR, GR, HR, HU, IE, IT, LT, LU, LV, MT, NL, PL, PT, RO, SE, SI, SK };
export type PhoneCountry = keyof typeof phoneFlags;

const regionNames = new Intl.DisplayNames('de', { type: 'region' });

export const phoneCountries = (Object.keys(phoneFlags) as PhoneCountry[])
  .map(code => ({ code, name: regionNames.of(code) ?? code, prefix: '+' + getCountryCallingCode(code) }))
  .sort((first, second) => first.name.localeCompare(second.name, 'de'));
