'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Info } from 'lucide-react';
import { toast } from 'sonner';
import styles from './styles.module.css';
import Header from '@/components/Header';
import { getStoredData } from '@/utils/store';
import { CsvUploadResponse } from '@/components/Landing/Hero/interfaces';
import CloseRateChart from '@/components/Dashboard/CloseRateChart';
import { calculateCloseRateByCategory } from '@/utils/close-rate-chart';

export default function CloseRate() {
  const router = useRouter();
  const [data, setData] = useState<CsvUploadResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasShownToast = useRef(false);

  // Load data on client side only to avoid hydration mismatch
  useEffect(() => {
    const loadData = () => {
      const storedData = getStoredData();
      if (storedData) {
        setData(storedData);
      } else {
        if (!hasShownToast.current) {
          toast.info('Sube un archivo CSV para que la IA lo procese');
          hasShownToast.current = true;
        }
        router.push('/');
      }
      setIsLoading(false);
    };
    
    loadData();
  }, [router]);

  // Get all classifications without filtering
  const classifications = useMemo(
    () => data?.classification?.classifications || [],
    [data]
  );

  // Calculate chart data based on all classifications
  const chartData = useMemo(() => {
    if (!classifications || classifications.length === 0) {
      return {
        closeRateByIndustry: [],
        closeRateByLeadSource: [],
        closeRateByInteractionVolume: [],
        closeRateByMainPainPoint: [],
        closeRateByTechMaturity: [],
        closeRateByUrgency: [],
      };
    }

    return {
      closeRateByIndustry: calculateCloseRateByCategory(classifications, 'industry'),
      closeRateByLeadSource: calculateCloseRateByCategory(classifications, 'leadSource'),
      closeRateByInteractionVolume: calculateCloseRateByCategory(classifications, 'interactionVolume'),
      closeRateByMainPainPoint: calculateCloseRateByCategory(classifications, 'mainPainPoint'),
      closeRateByTechMaturity: calculateCloseRateByCategory(classifications, 'techMaturity'),
      closeRateByUrgency: calculateCloseRateByCategory(classifications, 'urgency'),
    };
  }, [classifications]);

  // Calculate overall average close rate
  const overallAverageCloseRate = useMemo(() => {
    if (!classifications || classifications.length === 0) return 0;
    
    const totalLeads = classifications.length;
    const totalClosed = classifications.filter(c => c.isClosed === true).length;
    
    return totalLeads > 0 ? (totalClosed / totalLeads) * 100 : 0;
  }, [classifications]);

  if (isLoading || !data || !data.classification) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Cargando rendimiento...</p>
      </div>
    );
  }

  return (
    <div className={styles.closeRate}>
      <Header
        title="Rendimiento por Categoría"
        subtitle="Gráficos de Tasas de Cierre por Categoría"
        titleIcon={TrendingUp}
      />

      {/* Average Close Rate Section */}
      <div className={styles.averageSection}>
        <div className={styles.averageCard}>
          <div className={styles.averageHeader}>
            <TrendingUp className={styles.averageIcon} />
            <h2 className={styles.averageTitle}>Tasa de Cierre Promedio</h2>
          </div>
          <div className={styles.averageValue}>
            {overallAverageCloseRate.toFixed(1)}%
          </div>
          <p className={styles.averageDescription}>
            Basado en {classifications.length} {classifications.length === 1 ? 'lead' : 'leads'}
          </p>
        </div>
      </div>

      {/* Color Legend Section */}
      <div className={styles.legendSection}>
        <div className={styles.legendCard}>
          <div className={styles.legendHeader}>
            <Info className={styles.legendIcon} />
            <h3 className={styles.legendTitle}>Significado de los Colores</h3>
          </div>
          <div className={styles.legendItems}>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#059669' }}></div>
              <span className={styles.legendText}>
                <strong>Verde:</strong> Tasa de cierre igual o superior al promedio
              </span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#f59e0b' }}></div>
              <span className={styles.legendText}>
                <strong>Amarillo:</strong> Tasa de cierre entre el promedio y 20% por debajo del promedio
              </span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#ef4444' }}></div>
              <span className={styles.legendText}>
                <strong>Rojo:</strong> Tasa de cierre más de 20% por debajo del promedio
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Close Rate Title Section */}
      <div className={styles.classificationTitleSection}>
        <div className={styles.classificationTitleWrapper}>
          <BarChart3 className={styles.classificationIcon} />
          <h2 className={styles.classificationTitle}>Tasa de Cierre por Categoría</h2>
        </div>
      </div>

      {/* Close Rate Charts Section */}
      <div className={styles.closeRateChartsContainer}>
        <CloseRateChart
          title="Tasa de Cierre por Industria"
          data={chartData.closeRateByIndustry}
        />
        <CloseRateChart
          title="Tasa de Cierre por Fuente de Lead"
          data={chartData.closeRateByLeadSource}
        />
        <CloseRateChart
          title="Tasa de Cierre por Volumen de Interacción"
          data={chartData.closeRateByInteractionVolume}
        />
        <CloseRateChart
          title="Tasa de Cierre por Dolor Principal"
          data={chartData.closeRateByMainPainPoint}
        />
        <CloseRateChart
          title="Tasa de Cierre por Madurez Tecnológica"
          data={chartData.closeRateByTechMaturity}
        />
        <CloseRateChart
          title="Tasa de Cierre por Urgencia"
          data={chartData.closeRateByUrgency}
        />
      </div>
    </div>
  );
}

