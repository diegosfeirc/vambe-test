import { CsvUploadResponse } from "@/components/Landing/Hero/interfaces";

export function getStoredData(): CsvUploadResponse | null {
    if (typeof window === 'undefined') return null;
    
    const storedData = localStorage.getItem('csvUploadResult');
    if (!storedData) return null;
    
    try {
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Error parsing stored data:', error);
      return null;
    }
}