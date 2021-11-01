import { Country, waitForUserToConfirmWithButton } from ".";
import { Map } from "./map";
import { getFlag } from "./utils";

export const nameSelector = (options: Country[]) => {
  return `
  <select name="countries" id="name-selector">
  ${options.map((option) => {
    return `<option value="${option.iso_n3}">${option.name_long}</option>`;
  })}
</select>
  `;
};

export const flagSelector = (options: Country[]) => {
  return `
  <select name="countries" id="flag-selector">
  ${options.map((option) => {
    return `<option class="flag" value="${option.iso_n3}">${getFlag(
      option
    )}</option>`;
  })}
</select>
  `;
};

export const getSelectedName = async () => {
  await waitForUserToConfirmWithButton();
  const nameSelector = document.getElementById(
    "name-selector"
  ) as HTMLInputElement;
  const countryId = nameSelector.value;
  return countryId;
};

export const getSelectedFlag = async () => {
  await waitForUserToConfirmWithButton();
  const flagSelector = document.getElementById(
    "flag-selector"
  ) as HTMLInputElement;
  const countryId = flagSelector.value;
  return countryId;
};

export const getSelectedLocation = (map: Map): Promise<string> => {
  return new Promise((resolve) => {
    let countryId = "";
    let isConfirmed = false;
    waitForUserToConfirmWithButton().then(() => {
      isConfirmed = true;
      map.idToColorMappings = {};
      resolve(countryId);
    });

    map.getSelectedCountryId().then(async (id) => {
      countryId = id;
      map.idToColorMappings = { [countryId]: "yellow" };
      while (!isConfirmed) {
        map.idToColorMappings = { [countryId]: "yellow" };
        countryId = await map.getSelectedCountryId();
      }
    });
  });
};
