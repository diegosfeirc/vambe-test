'use client';

import { Upload, Sparkles, Database, BarChart } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';
import { uploadAndClassifyCsv } from '@/server/csv-parser';

export default function Hero() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file extension
    if (!file.name.endsWith('.csv')) {
      alert('Por favor selecciona un archivo CSV válido');
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadAndClassifyCsv(file);
      
      localStorage.setItem('csvUploadResult', JSON.stringify(result));
      router.push('/dashboard');
    } catch (error) {
      console.error('Error uploading file:', error);
      let errorMessage = 'Error desconocido al procesar el archivo';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      setIsUploading(false);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Badge */}
          <div className={styles.badge}>
            <Sparkles className={styles.badgeIcon} />
            <span>Análisis inteligente de ventas con IA</span>
          </div>

          {/* Main Title */}
          <h1 className={styles.title}>
            Transforma tus reuniones
            <br />
            <span className={styles.titleGradient}>
              en insights accionables
            </span>
          </h1>

          {/* Description */}
          <p className={styles.description}>
            Vambe Meetings procesa transcripciones de tus reuniones de ventas y extrae automáticamente 
            información clave de clientes mediante inteligencia artificial, organizando datos 
            en categorías precisas y generando métricas relevantes para tu negocio.
          </p>

          {/* Features Grid */}
          <div className={styles.features}>
            <div className={styles.featureCard}>
              <div className={`${styles.featureIcon} ${styles.featureIconBlue}`}>
                <Database />
              </div>
              <h3 className={styles.featureTitle}>Procesamiento Automático</h3>
              <p className={styles.featureDescription}>
                Categorización inteligente de datos mediante modelos de lenguaje avanzados
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={`${styles.featureIcon} ${styles.featureIconIndigo}`}>
                <BarChart />
              </div>
              <h3 className={styles.featureTitle}>Métricas en Tiempo Real</h3>
              <p className={styles.featureDescription}>
                Visualiza insights clave con dashboards interactivos y actualizados
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={`${styles.featureIcon} ${styles.featureIconPurple}`}>
                <Sparkles />
              </div>
              <h3 className={styles.featureTitle}>Análisis Inteligente</h3>
              <p className={styles.featureDescription}>
                Extracción precisa de información de clientes de forma automatizada
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className={styles.ctaSection}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button 
              onClick={handleFileUpload} 
              className={styles.ctaButton}
              disabled={isUploading}
            >
              <Upload className={styles.ctaIcon} />
              {isUploading ? 'Procesando...' : 'Subir archivo CSV'}
            </button>
            <p className={styles.ctaSubtext}>
              Comienza analizando tus transcripciones de ventas
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
