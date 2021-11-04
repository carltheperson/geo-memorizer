import { countryCode } from "emoji-flags";
import { Country, WayToGuess } from ".";
import { tsv } from "d3-fetch";
import {
  COUNTRY_IDS_IN_MAP_DATA_BUT_NOT_ON_MAP,
  COUNTRY_NAMES_IN_MAP_DATA_BUT_NOT_ON_MAP,
  EXTRA_NAME_TO_FLAG_MAPPINGS,
  MAP_DATA_URL,
  NO_FLAG_SUBSTITUTE,
  PROMPT_DEFAULT_COLOR,
} from "./constants";

export const getFlag = (country: Country) => {
  const emojiCountry = countryCode(country.iso_a2);
  const emoji = emojiCountry ? emojiCountry.emoji : NO_FLAG_SUBSTITUTE;
  if (emoji === NO_FLAG_SUBSTITUTE) {
    if (EXTRA_NAME_TO_FLAG_MAPPINGS[country.name_long]) {
      return EXTRA_NAME_TO_FLAG_MAPPINGS[country.name_long];
    }
  }
  return emoji;
};

export const getRandomNumber = (max: number) => Math.floor(Math.random() * max);

export const getRandomCountry = (countries: Country[]) => {
  return countries[getRandomNumber(countries.length)];
};

export const getNRandomCountries = (countries: Country[], n: number) => {
  return new Array(n).fill(0).map(() => getRandomCountry(countries));
};

export const getNRandomCountriesWithOneCorrect = (
  countries: Country[],
  n: number,
  correct: Country
) => {
  const randomCountries = getNRandomCountries(countries, n);
  const correctCountryI = getRandomNumber(n);
  randomCountries[correctCountryI] = correct;
  return randomCountries;
};

export const getRandomWayToGuess = () => {
  return getRandomNumber(Object.keys(WayToGuess).length / 2);
};

export const pickRandomFromArray = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const screen = document.getElementById("screen") as HTMLDivElement;

export const changeScreenColor = (color: string) => {
  screen.style.backgroundColor = color;
};

export const flashScreenColor = (color: string, ms: number) =>
  new Promise((resolve) => {
    screen.style.backgroundColor = color;
    setTimeout(() => {
      changeScreenColor(PROMPT_DEFAULT_COLOR);
      resolve(null);
    }, ms);
  });

const screenMessage = document.getElementById(
  "screen-message"
) as HTMLParagraphElement;

export const setScreenMessage = (text: string) => {
  screenMessage.innerText = text;
};

export const timeout = (ms: number) =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve(null);
    }, ms)
  );

export const getListOfCountries = async (): Promise<Country[]> => {
  const countries: Country[] = (await tsv(MAP_DATA_URL)) as any[];

  return countries.reduce<Country[]>((acc, country) => {
    if (
      COUNTRY_IDS_IN_MAP_DATA_BUT_NOT_ON_MAP.includes(country.iso_n3) ||
      COUNTRY_NAMES_IN_MAP_DATA_BUT_NOT_ON_MAP.includes(country.name_long)
    ) {
      return acc;
    }

    return [...acc, country];
  }, []);
};

export const getPointsMessage = (points: number) => {
  if (points === 1) return "1 point";
  return `${points} points`;
};

export const getLabelMappingsForAllCountries = (countries: Country[]) => {
  return countries.reduce((mappings, country) => {
    return {
      ...mappings,
      [country.iso_n3]: `${getFlag(country)} ${country.name_long}`,
    };
  }, {});
};
