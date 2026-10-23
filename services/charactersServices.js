import { ApiError } from '../middleware/errors.js';

const API_URL = 'https://akabab.github.io/superhero-api/api/all.json';
const REQUEST_TIMEOUT = 10 * 1000;

function readObject(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }
  return {};
}

function readText(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const cleaned = value.trim();
  if (!cleaned || cleaned === '-') {
    return null;
  }

  return cleaned;
}

function readList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const items = [];
  for (const item of value) {
    const cleaned = readText(item);
    if (cleaned) {
      items.push(cleaned);
    }
  }

  return items;
}

function readImage(value) {
  if (typeof value !== 'string') {
    return null;
  }

  try {
    const imageUrl = new URL(value);
    if (imageUrl.protocol === 'https:') {
      return imageUrl.href;
    }
  } catch (error) {
    return null;
  }

  return null;
}

function normalizeCharacter(character) {
  const biography = readObject(character.biography);
  const appearance = readObject(character.appearance);
  const work = readObject(character.work);
  const connections = readObject(character.connections);
  const images = readObject(character.images);
  const powerstatsData = readObject(character.powerstats);

  const name = readText(character.name);
  const fullName = readText(biography.fullName);
  const placeOfBirth = readText(biography.placeOfBirth);
  const occupation = readText(work.occupation);
  const firstAppearance = readText(biography.firstAppearance);

  const summaryParts = [];
  if (fullName) {
    summaryParts.push(`${name}'s full name is ${fullName}.`);
  }
  if (placeOfBirth) {
    summaryParts.push(`Place of birth: ${placeOfBirth}.`);
  }
  if (occupation) {
    summaryParts.push(`Occupation: ${occupation}.`);
  }
  if (firstAppearance) {
    summaryParts.push(`First appearance: ${firstAppearance}.`);
  }

  const powerstats = {};
  const statNames = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];
  for (const statName of statNames) {
    const value = powerstatsData[statName];
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100) {
      powerstats[statName] = value;
    } else {
      powerstats[statName] = null;
    }
  }

  let image = readImage(images.lg);
  if (!image) {
    image = readImage(images.md);
  }
  if (!image) {
    image = readImage(images.sm);
  }

  return {
    id: character.id,
    name,
    fullName,
    image,
    powerstats,
    placeOfBirth,
    biography: summaryParts.length > 0 ? summaryParts.join(' ') : null,
    aliases: readList(biography.aliases),
    gender: readText(appearance.gender),
    race: readText(appearance.race),
    height: readList(appearance.height),
    weight: readList(appearance.weight),
    eyeColor: readText(appearance.eyeColor),
    hairColor: readText(appearance.hairColor),
    groupAffiliation: readText(connections.groupAffiliation),
    publisher: readText(biography.publisher),
    alignment: readText(biography.alignment),
    occupation,
    firstAppearance
  };
}

function validateCharacters(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  const ids = new Set();
  for (const character of data) {
    if (!character || typeof character !== 'object') {
      return false;
    }
    if (!Number.isSafeInteger(character.id) || character.id < 1) {
      return false;
    }
    if (!readText(character.name)) {
      return false;
    }
    if (ids.has(character.id)) {
      return false;
    }
    ids.add(character.id);
  }

  return true;
}

export async function getCharacters() {
  try {
    const response = await fetch(API_URL, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    });

    if (!response.ok) {
      throw new ApiError(502, 'The superhero service returned an error. Try again later.');
    }

    const data = await response.json();
    if (!validateCharacters(data)) {
      throw new ApiError(502, 'The superhero service returned invalid data.');
    }

    const characters = data.map(character => normalizeCharacter(character));
    characters.sort((first, second) => first.id - second.id);
    return characters;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new ApiError(504, 'The superhero service took too long to respond. Try again.');
    }

    throw new ApiError(502, 'Could not read the superhero service. Try again later.');
  }
}

export async function searchCharacters(search = '') {
  const characters = await getCharacters();
  const normalizedSearch = search.toLowerCase();
  const matches = characters
    .filter(character => character.name.toLowerCase().includes(normalizedSearch))
    .map(character => ({
      id: character.id,
      name: character.name,
      image: character.image
    }));

  if (matches.length === 0) {
    throw new ApiError(404, 'No characters matched that name.');
  }

  return { results: matches };
}

export async function getCharacterById(id) {
  const characters = await getCharacters();
  let characterIndex = -1;

  for (let index = 0; index < characters.length; index++) {
    if (characters[index].id === id) {
      characterIndex = index;
      break;
    }
  }

  if (characterIndex === -1) {
    throw new ApiError(404, 'Character not found.');
  }

  let previousIndex = characterIndex - 1;
  if (previousIndex < 0) {
    previousIndex = characters.length - 1;
  }

  let nextIndex = characterIndex + 1;
  if (nextIndex >= characters.length) {
    nextIndex = 0;
  }

  return {
    ...characters[characterIndex],
    prevId: characters[previousIndex].id,
    nextId: characters[nextIndex].id
  };
}
