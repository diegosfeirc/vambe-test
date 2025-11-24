import type { NextConfig } from "next";
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

const envPath = resolve(__dirname, '../.env');
if (existsSync(envPath)) {
  config({ path: envPath });
}

const nextConfig: NextConfig = {
  output: 'standalone', // Necesario para Docker
};

export default nextConfig;
