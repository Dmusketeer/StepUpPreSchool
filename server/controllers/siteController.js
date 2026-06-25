import { readSiteData } from "../models/siteModel.js";

export async function getSite(_request, response, next) {
  try {
    response.json(await readSiteData());
  } catch (error) {
    next(error);
  }
}

export async function getPrograms(_request, response, next) {
  try {
    const siteData = await readSiteData();
    response.json(siteData.programs);
  } catch (error) {
    next(error);
  }
}

export async function getEvents(_request, response, next) {
  try {
    const siteData = await readSiteData();
    response.json(siteData.events);
  } catch (error) {
    next(error);
  }
}

export async function getGallery(_request, response, next) {
  try {
    const siteData = await readSiteData();
    response.json(siteData.gallery);
  } catch (error) {
    next(error);
  }
}

export async function getMedia(_request, response, next) {
  try {
    const siteData = await readSiteData();
    response.json(siteData.media);
  } catch (error) {
    next(error);
  }
}

export async function getTestimonials(_request, response, next) {
  try {
    const siteData = await readSiteData();
    response.json(siteData.testimonials);
  } catch (error) {
    next(error);
  }
}
