import portfolio from "./portfolio.json" with { type: "json" };
export function validatePortfolio(data) {
  for (const key of [
    "identity",
    "workExperience",
    "projects",
    "certifications",
    "skills",
    "about",
    "contact",
  ])
    if (!data[key]) throw new Error(`Missing portfolio section: ${key}`);
  for (const key of [
    "workExperience",
    "projects",
    "certifications",
    "skills",
  ]) {
    if (!Array.isArray(data[key])) throw new Error(`${key} must be an array`);
    const ids = new Set();
    for (const item of data[key]) {
      if (!item.id || ids.has(item.id))
        throw new Error(`Missing or duplicate ID in ${key}`);
      ids.add(item.id);
    }
  }
  return data;
}
export const data = validatePortfolio(portfolio);
