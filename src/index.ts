import { tsv } from "d3-fetch";
import { MAP_DATA_URL } from "./constants";
import { Map } from "./map";
import {
  flagSelector,
  getSelectedFlag,
  getSelectedLocation,
  getSelectedName,
  nameSelector,
} from "./selectors";
import {
  getFlag,
  getNRandomCountries,
  getRandomCountry,
  getRandomNumber,
  getRandomWayToGuess,
} from "./utils";

export interface Country {
  name_long: string;
  /** Main id */
  iso_n3: string;
  /** Id used for emojis */
  iso_a2: string;
}

const map = new Map();
map.drawMap();

const drawAllInformationForCountry = (country: Country) => {
  const flag = getFlag(country);

  const screen = document.getElementById("prompt") as HTMLDivElement;
  screen.innerHTML = `
  <h4>Country name</h4>
  ${country.name_long}
  
  <h4>Flag</h4>
  <p class="flag">${flag}</p>
  
  <h4>Location</h4>
  View map

  <br/><br/><button id="button">Memorized?</button>
  `;

  map.idToColorMappings = { [country.iso_n3]: "red" };
  map.idToLabelMappings = { [country.iso_n3]: `${flag} ${country.name_long}` };
};

export const waitForUserToConfirmWithButton = (): Promise<void> => {
  return new Promise((resolve) => {
    const button = document.getElementById("button") as HTMLButtonElement;
    button.addEventListener("click", () => {
      resolve();
    });
  });
};

export enum WayToGuess {
  NAME,
  FLAG,
  LOCATION,
}
const drawMemorizerPrompt = (
  options: Country[],
  correctOption: Country,
  wayToGuess: WayToGuess
) => {
  if (wayToGuess != WayToGuess.LOCATION) {
    map.idToColorMappings = { [correctOption.iso_n3]: "red" };
    map.idToLabelMappings = {
      [correctOption.iso_n3]: `${getFlag(correctOption)} ${
        correctOption.name_long
      }`,
    };
  }

  const screen = document.getElementById("prompt") as HTMLDivElement;
  screen.innerHTML = `
  <h4>Country name</h4>
  ${
    wayToGuess == WayToGuess.NAME
      ? nameSelector(options)
      : correctOption.name_long
  }

  <h4>Flag</h4>
  <p class="flag">${
    wayToGuess == WayToGuess.FLAG
      ? flagSelector(options)
      : getFlag(correctOption)
  }</p>

  <h4>Location</h4>
  ${
    wayToGuess == WayToGuess.LOCATION
      ? "Select a location on the map"
      : "View map"
  }

  <br/><br/><button id="button">Submit</button>
  `;
};

const getSubmittedGuessedCountryId = async (wayToGuess: WayToGuess) => {
  if (wayToGuess === WayToGuess.NAME) {
    return await getSelectedName();
  }
  if (wayToGuess === WayToGuess.FLAG) {
    return await getSelectedFlag();
  }
  if (wayToGuess === WayToGuess.LOCATION) {
    return await getSelectedLocation(map);
  }
  throw new Error(`Way to guess ${wayToGuess} is not supported`);
};

const BUFFER = 4;
const OPTION_AMOUNT = 4;

const runGameLoop = async () => {
  const countriesToBeGuessed: Country[] = [];
  const countries: Country[] = (await tsv(MAP_DATA_URL)) as any[];
  while (true) {
    if (countriesToBeGuessed.length < BUFFER) {
      const country = getRandomCountry(countries);
      drawAllInformationForCountry(country);
      await waitForUserToConfirmWithButton();
      countriesToBeGuessed.push(country);
    } else {
      map.idToColorMappings = {};
      const country = countriesToBeGuessed[0];
      const randomCountries = getNRandomCountries(countries, OPTION_AMOUNT);
      const correctCountryI = getRandomNumber(OPTION_AMOUNT);
      randomCountries[correctCountryI] = country;

      const wayToGuess = getRandomWayToGuess();
      drawMemorizerPrompt(randomCountries, country, wayToGuess);

      const guess = await getSubmittedGuessedCountryId(wayToGuess);
      if (guess == country.iso_n3) {
        console.log("CORRECT");
      } else {
        console.log("NOT CORRECT", country);
      }

      countriesToBeGuessed.shift();
    }
  }
};

map.onLoad(() => {
  runGameLoop();
});
