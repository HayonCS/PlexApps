import { buildQueries, Matcher, MatcherOptions, queries, queryHelpers, within } from "@testing-library/dom";
import { render, RenderOptions, screen } from "@testing-library/react";
import React from "react";

//BY DATA FIELD
const queryAllByDataField = (container: HTMLElement, id: Matcher, options?: MatcherOptions | undefined) =>
  queryHelpers.queryAllByAttribute("data-field", container, id, options);

const getMultipleErrorDataField = (c: any, dataFieldValue: string) =>
  `Found multiple elements with the data-field attribute of: ${dataFieldValue}`;
const getMissingErrorDataField = (c: any, dataFieldValue: string) =>
  `Unable to find an element with the data-field attribute of: ${dataFieldValue}`;

const [queryByDataField, getAllByDataField, getByDataField, findAllByDataField, findByDataField] = buildQueries(
  queryAllByDataField,
  getMultipleErrorDataField,
  getMissingErrorDataField
);

//BY DATA ID
const queryAllByDataId = (container: HTMLElement, id: Matcher, options?: MatcherOptions | undefined) =>
  queryHelpers.queryAllByAttribute("data-id", container, id, options);

const getMultipleErrorDataId = (c: any, dataFieldValue: string) =>
  `Found multiple elements with the data-id attribute of: ${dataFieldValue}`;
const getMissingErrorDataId = (c: any, dataFieldValue: string) =>
  `Unable to find an element with the data-id attribute of: ${dataFieldValue}`;

const [queryByDataId, getAllByDataId, getByDataId, findAllByDataId, findByDataId] = buildQueries(
  queryAllByDataId,
  getMultipleErrorDataId,
  getMissingErrorDataId
);

//Group all of the custom queries up.
const customQueries = {
  queryByDataField,
  getAllByDataField,
  getByDataField,
  findAllByDataField,
  findByDataField,
  queryByDataId,
  getAllByDataId,
  getByDataId,
  findAllByDataId,
  findByDataId,
};

//Add custom queries to the render method.
const customRender = (ui: React.ReactNode, options?: RenderOptions) =>
  render(ui, { queries: { ...queries, ...customQueries }, ...options });

//Add custom queries to the within method.
const customWithin = (element: HTMLElement) => within(element, { ...queries, ...customQueries });

const boundQueries = within<typeof customQueries>(document.body, customQueries);

const customScreen = { ...screen, ...boundQueries };

//Re-export stuff from rtl.
export * from "@testing-library/react";

//Override these ones.
export {
  customRender as render,
  customWithin as within,
  customScreen as screen,
  queryByDataField,
  getAllByDataField,
  getByDataField,
  findAllByDataField,
  findByDataField,
  queryByDataId,
  getAllByDataId,
  getByDataId,
  findAllByDataId,
  findByDataId,
};
