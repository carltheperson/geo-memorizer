import { countryCode } from "emoji-flags";
import { Country, WayToGuess } from ".";

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

export const getRandomWayToGuess = () => {
  return getRandomNumber(Object.keys(WayToGuess).length / 2);
};

export const pickRandomFromArray = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};
