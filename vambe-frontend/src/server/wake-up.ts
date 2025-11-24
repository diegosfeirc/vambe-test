import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const wakeUpBackend = async (): Promise<void> => {
  try {
    await axios.get(`${API_URL}/`, { timeout: 5000 });
  } catch {
    console.log('Backend wake-up call (expected to fail if cold-start)');
  }
};

