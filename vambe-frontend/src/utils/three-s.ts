import { ClientClassification } from "@/components/Leads/ClassificationTable/interfaces";
import { ThreeSRecommendations } from "@/server/interfaces";

const CACHE_KEY_PREFIX = 'threeS_recommendations_';
const CACHE_TIMESTAMP_KEY_PREFIX = 'threeS_timestamp_';

export const threeSDescriptions = {
    start: {
      title: 'Start',
      description:
        'Identifica nuevas acciones, prácticas o estrategias que deberías comenzar a implementar para mejorar tus resultados de ventas. Estas recomendaciones se basan en oportunidades detectadas en tus datos.',
    },
    stop: {
      title: 'Stop',
      description:
        'Señala actividades, procesos o hábitos que están obstaculizando tu desempeño o generando ineficiencias. Dejar de hacer estas cosas liberará recursos y mejorará tus resultados.',
    },
    spiceUp: {
      title: 'Spice Up',
      description:
        'Destaca prácticas exitosas que ya estás realizando y cómo puedes optimizarlas, potenciarlas o hacerlas más impactantes. Se enfoca en maximizar lo que ya funciona bien.',
    },
};

export function calculateClassificationsHash(
  classifications: ClientClassification[],
): string {
  const dataString = JSON.stringify(classifications);
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

function getCacheKey(hash: string): string {
  return `${CACHE_KEY_PREFIX}${hash}`;
}

function getTimestampKey(hash: string): string {
  return `${CACHE_TIMESTAMP_KEY_PREFIX}${hash}`;
}

export function getCachedRecommendations(
  hash: string,
): ThreeSRecommendations | null {
  if (typeof window === 'undefined') return null;

  try {
    const cacheKey = getCacheKey(hash);
    const timestampKey = getTimestampKey(hash);

    const cached = localStorage.getItem(cacheKey);
    const timestamp = localStorage.getItem(timestampKey);

    if (!cached || !timestamp) {
      return null;
    }

    const cacheAge = Date.now() - parseInt(timestamp, 10);
    const CACHE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

    if (cacheAge > CACHE_EXPIRATION_MS) {
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(timestampKey);
      return null;
    }

    return JSON.parse(cached) as ThreeSRecommendations;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

export function saveCachedRecommendations(
  hash: string,
  recommendations: ThreeSRecommendations,
): void {
  if (typeof window === 'undefined') return;

  const cacheKey = getCacheKey(hash);
  const timestampKey = getTimestampKey(hash);

  try {
    localStorage.setItem(cacheKey, JSON.stringify(recommendations));
    localStorage.setItem(timestampKey, Date.now().toString());
  } catch (error) {
    console.error('Error saving cache:', error);
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith(CACHE_KEY_PREFIX) ||
            key.startsWith(CACHE_TIMESTAMP_KEY_PREFIX))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      localStorage.setItem(cacheKey, JSON.stringify(recommendations));
      localStorage.setItem(timestampKey, Date.now().toString());
    } catch (retryError) {
      console.error('Error retrying cache save:', retryError);
    }
  }
}