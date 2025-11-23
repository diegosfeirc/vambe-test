import axios from 'axios';
import { ClientClassification } from '@/components/Leads/ClassificationTable/interfaces';
import { ThreeSRecommendations } from './interfaces';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateThreeS = async (
  classifications: ClientClassification[],
): Promise<ThreeSRecommendations> => {
  const response = await apiClient.post<ThreeSRecommendations>(
    '/ai-classification/three-s',
    { classifications },
  );
  return response.data;
};
