'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import styles from './styles.module.css';
import Header from '@/components/Header';
import { getStoredData } from '@/utils/store';
import { CsvUploadResponse } from '@/components/Landing/Hero/interfaces';
import PieChart from '@/components/Dashboard/PieChart';
import SalesManChart from '@/components/Dashboard/SalesmanChart';
import SalesTendencyChart from '@/components/Dashboard/SalesTendencyChart';
import DashboardFilters from '@/components/Dashboard/Filters';
import ThreeSRecommendations from '@/components/Dashboard/ThreeSRecommendations';
import { calculateCategoryCounts } from '@/utils/pie-charts';
import { calculateSalesPerSalesperson } from '@/utils/salesman-chart';
import { calculateLeadsPerMonth } from '@/utils/sales-tendency-chart';
import { FilterOptions, extractFilterOptions, applyFilters } from '@/utils/filters';

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<CsvUploadResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasShownToast = useRef(false);

  // Initialize filter state (only Vendedor and Cerrada)
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    vendedor: [],
    cerrada: ['all'],
    industria: [],
    fuente: [],
    volumen: [],
    dolorPrincipal: [],
    madurezTech: [],
    urgencia: [],
  });

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


  // Extract available filter options (only Vendedor and Cerrada)
  const availableFilters = useMemo(
    () => {
      if (!data?.classification?.classifications) {
        return {
          vendedor: [],
          cerrada: ['all'] as ('true' | 'false' | 'all')[],
        };
      }
      const allFilters = extractFilterOptions(data.classification.classifications);
      return {
        vendedor: allFilters.vendedor,
        cerrada: allFilters.cerrada,
      };
    },
    [data]
  );

  // Get all classifications without filters (for 3S recommendations)
  const allClassifications = useMemo(
    () => {
      if (!data?.classification?.classifications) return [];
      return data.classification.classifications;
    },
    [data]
  );

  // Apply filters to get filtered classifications
  const filteredClassifications = useMemo(
    () => {
      if (!data?.classification?.classifications) return [];
      return applyFilters(data.classification.classifications, activeFilters);
    },
    [data, activeFilters]
  );

  // Calculate chart data based on filtered classifications
  const chartData = useMemo(() => {
      if (!filteredClassifications || filteredClassifications.length === 0) {
      return {
        salesPerSalesperson: [],
        industry: [],
        leadSource: [],
        interactionVolume: [],
        mainPainPoint: [],
        techMaturity: [],
        urgency: [],
        leadsPerMonth: [],
      };
    }

    return {
      salesPerSalesperson: calculateSalesPerSalesperson(filteredClassifications),
      industry: calculateCategoryCounts(filteredClassifications, 'industry'),
      leadSource: calculateCategoryCounts(filteredClassifications, 'leadSource'),
      interactionVolume: calculateCategoryCounts(filteredClassifications, 'interactionVolume'),
      mainPainPoint: calculateCategoryCounts(filteredClassifications, 'mainPainPoint'),
      techMaturity: calculateCategoryCounts(filteredClassifications, 'techMaturity'),
      urgency: calculateCategoryCounts(filteredClassifications, 'urgency'),
      leadsPerMonth: calculateLeadsPerMonth(filteredClassifications),
    };
  }, [filteredClassifications]);

  // Handle filter changes
  const handleVendedorChange = useCallback((values: string[]) => {
    setActiveFilters((prev) => ({
      ...prev,
      vendedor: values,
    }));
  }, []);

  const handleCerradaChange = useCallback((values: ('true' | 'false' | 'all')[]) => {
    setActiveFilters((prev) => ({
      ...prev,
      cerrada: values,
    }));
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setActiveFilters({
      vendedor: [],
      cerrada: ['all'],
      industria: [],
      fuente: [],
      volumen: [],
      dolorPrincipal: [],
      madurezTech: [],
      urgencia: [],
    });
  }, []);

  if (isLoading || !data || !data.classification) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Cargando dashboard...</p>
      </div>
    );
  }

  const { classification } = data;

  return (
    <div className={styles.dashboard}>
      <Header
        title="Dashboard de Leads"
        subtitle={`Gráficos y Métricas de ${classification.totalClients} leads procesados y clasificados con IA`}
        titleIcon={Sparkles}
      />

      {/* 3 S Recommendations Section - Before filters, uses all data */}
      <div className={styles.threeSSection}>
        <ThreeSRecommendations classifications={allClassifications} />
      </div>

      {/* Classification Title Section */}
      <div className={styles.classificationTitleSection}>
        <div className={styles.classificationTitleWrapper}>
          <BarChart3 className={styles.classificationIcon} />
          <h2 className={styles.classificationTitle}>Clasificación de Leads</h2>
        </div>
      </div>

      {/* Filters Section */}
      <DashboardFilters
        availableVendedores={availableFilters.vendedor}
        availableCerrada={availableFilters.cerrada}
        selectedVendedor={activeFilters.vendedor}
        selectedCerrada={activeFilters.cerrada}
        onVendedorChange={handleVendedorChange}
        onCerradaChange={handleCerradaChange}
        onClearFilters={handleClearFilters}
      />

      <div className={styles.chartsContainer}>
        <PieChart
          title="Industria"
          data={chartData.industry}
          emoji="🏭"
        />
        <PieChart
          title="Fuente de Lead"
          data={chartData.leadSource}
          emoji="📍"
        />
        <PieChart
          title="Volumen de Interacción"
          data={chartData.interactionVolume}
          emoji="💬"
        />
        <PieChart
          title="Dolor Principal"
          data={chartData.mainPainPoint}
          emoji="⚠️"
        />
        <PieChart
          title="Madurez Tecnológica"
          data={chartData.techMaturity}
          emoji="💻"
        />
        <PieChart
          title="Urgencia"
          data={chartData.urgency}
          emoji="⏰"
        />
      </div>

      {/* Sales Tendency Chart Section */}
      <div className={styles.salesChartSection}>
        <SalesTendencyChart data={chartData.leadsPerMonth} />
      </div>

      {/* Sales Chart Section */}
      <div className={styles.salesChartSection}>
        <SalesManChart data={chartData.salesPerSalesperson} />
      </div>
      
    </div>
  );
}


