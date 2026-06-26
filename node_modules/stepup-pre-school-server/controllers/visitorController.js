import { getVisitorStats, recordVisit } from "../models/visitorModel.js";

export async function getVisits(_request, response, next) {
  try {
    response.json(await getVisitorStats());
  } catch (error) {
    next(error);
  }
}

export async function createVisit(_request, response, next) {
  try {
    response.status(201).json(await recordVisit());
  } catch (error) {
    next(error);
  }
}