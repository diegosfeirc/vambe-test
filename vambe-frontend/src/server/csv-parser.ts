import axios from 'axios';
import { CsvUploadResponse } from '@/components/Landing/Hero/interfaces';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const uploadCsv = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/csv-parser/upload', formData);
  return response.data;
};

export const uploadAndClassifyCsv = async (file: File): Promise<CsvUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<CsvUploadResponse>(
    '/csv-parser/upload-and-classify',
    formData
  );
  return response.data;
};

