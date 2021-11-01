import { countryCode } from "emoji-flags";
import { Country, WayToGuess } from ".";
import { PROMPT_DEFAULT_COLOR } from "./constants";

export const getFlag = (country: Country) => {
  const emojiCountry = countryCode(country.iso_a2);
  const emoji = emojiCountry ? emojiCountry.emoji : "NO FLAG";
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
