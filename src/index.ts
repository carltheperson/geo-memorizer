import { tsv } from "d3-fetch";
import { CK, countryCode } from "emoji-flags";
import { MAP_DATA_URL } from "./constants";
import { Map } from "./map";

interface Country {
  name_long: string;
  /** Main id */
  iso_n3: string;
  /** Id used for emojis */
  iso_a2: string;
}

const map = new Map();
map.drawMap();

// map.getSelectedCountryId().then(async (id) => {
//   while (true) {
//     const allCountryData: any[] = await tsv(MAP_DATA_URL);
//     const code =
//       allCountryData.find((countryData) => countryData.iso_n3 === id).iso_a2 ??
//       "";
//     map.idToLabelMappings = { [id]: countryCode(code).emoji };
//     drawAllInformationForCountry(
//       allCountryData.find((countryData) => countryData.iso_n3 === id)
//     );

//     id = await map.getSelectedCountryId();
//   }
// });

const getFlag = (country: Country) => {
  const emojiCountry = countryCode(country.iso_a2);
  const emoji = emojiCountry ? emojiCountry.emoji : "NO FLAG";
  return emoji;
};

const drawAllInformationForCountry = (country: Country) => {
  const flag = getFlag(country);

  const screen = document.getElementById("prompt")!;
  screen.innerHTML = `
  <h4>Country name</h4>
  ${country.name_long}
  
  <h4>Flag</h4>
  <p class="flag">${flag}</p>
  
  <h4>Location</h4>
  View map

  <br/>
  <br/>
  <button id="button">Memorized?</button>
  `;

  map.idToColorMappings = { [country.iso_n3]: "red" };
  map.idToLabelMappings = { [country.iso_n3]: `${flag} ${country.name_long}` };
};

const waitForUserToConfirmMemorization = (): Promise<void> => {
  return new Promise((resolve) => {
    const button = document.getElementById("button")!;
    button.addEventListener("click", () => {
      resolve();
    });
  });
};

const getRandomNumber = (max: number) => Math.floor(Math.random() * max);

const getRandomCountry = (countries: Country[]) => {
  return countries[getRandomNumber(countries.length)];
};

const getNRandomCountries = (countries: Country[], n: number) => {
  return new Array(n).fill(0).map(() => getRandomCountry(countries));
};

const nameSelector = (options: Country[]) => {
  return `
  <select name="countries" id="name-selector">
  ${options.map((option, i) => {
    return `<option value="${option.name_long}">${option.name_long}</option>`;
  })}
</select>
  `;
};

const flagSelector = (options: Country[]) => {
  return `
  <select name="countries" id="flag-selector">
  ${options.map((option, i) => {
    return `<option class="flag" value="${getFlag(option)}">${getFlag(
      option
    )}</option>`;
  })}
</select>
  `;
};

enum WayToGuess {
  NAME,
  FLAG,
  LOCATION,
}
const drawMemorizerPromt = (
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

  const screen = document.getElementById("prompt")!;
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

  <br/>
  <br/>
  <button id="button">Submit</button>
  `;
};

const getSubmittedGuess = (wayToGuess: WayToGuess): Promise<string> => {
  return new Promise((resolve) => {
    let locationSelectedId = "";
    if (wayToGuess === WayToGuess.LOCATION) {
      console.log("HERE");
      map.getSelectedCountryId().then((id) => {
        map.idToColorMappings = { [id]: "yellow" };
        locationSelectedId = id;
      });
    }

    const button = document.getElementById("button")!;
    button.addEventListener("click", () => {
      if (wayToGuess === WayToGuess.NAME) {
        const nameSelector = document.getElementById("name-selector")!;
        resolve((nameSelector as any).value as string);
      }
      if (wayToGuess === WayToGuess.FLAG) {
        const nameSelector = document.getElementById("flag-selector")!;
        resolve((nameSelector as any).value as string);
      }
      if (wayToGuess === WayToGuess.LOCATION) resolve(locationSelectedId);
    });
  });
};

const BUFFER = 4;
const OPTION_AMOUNT = 4;

const runGameLoop = async () => {
  let displayed = 0;
  let geussed = 0;
  const countriesDisplayed: Country[] = [];
  const countries: Country[] = (await tsv(MAP_DATA_URL)) as any[];
  while (true) {
    console.log(displayed, geussed);
    if (displayed < BUFFER || displayed - BUFFER == geussed) {
      const country = getRandomCountry(countries);
      drawAllInformationForCountry(country);
      await waitForUserToConfirmMemorization();
      countriesDisplayed.push(country);
      displayed += 1;
    } else {
      map.idToColorMappings = {};
      const country = countriesDisplayed[displayed - BUFFER + geussed];
      console.log("Guess mode! Find ", country.name_long);

      const randomCountries = getNRandomCountries(countries, OPTION_AMOUNT);
      const correctCountryI = getRandomNumber(OPTION_AMOUNT);
      randomCountries[correctCountryI] = country;
      console.log(
        "Options",
        randomCountries.map((c) => c.name_long)
      );

      const wayToGuess = getRandomNumber(3);
      drawMemorizerPromt(randomCountries, country, wayToGuess);

      const guess = await getSubmittedGuess(wayToGuess);
      if (
        guess == country.name_long ||
        guess == country.iso_n3 ||
        guess == getFlag(country)
      ) {
        console.log("CORRECT");
      } else {
        console.log("NOT CORRECT", country);
      }
      geussed += 1;
    }
  }
};

setTimeout(() => {
  runGameLoop();
}, 1000);
