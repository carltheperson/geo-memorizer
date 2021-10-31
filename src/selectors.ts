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

export const getSelectedLocation = async (map: Map) => {
  const countryId = await map.getSelectedCountryId();
  map.idToColorMappings = { [countryId]: "yellow" };
  await waitForUserToConfirmWithButton();
  return countryId;
};
