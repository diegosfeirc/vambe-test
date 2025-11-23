'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Users, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import styles from './styles.module.css';
import { CsvUploadResponse } from '@/components/Landing/Hero/interfaces';
import Header from '@/components/Header';
import ClassificationTable from '@/components/Leads/ClassificationTable';
import StatCard from '@/components/Leads/StatCard';
import Filters from '@/components/Leads/Filters';
import Searcher from '@/components/Leads/Searcher';
import { getStoredData } from '@/utils/store';
import { FilterOptions, extractFilterOptions, applyFilters, searchClientsByName } from '@/utils/filters';

export default function Leads() {
  const router = useRouter();
  const [data, setData] = useState<CsvUploadResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasShownToast = useRef(false);
  
  // Initialize filter state
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

  // Initialize search state
  const [searchQuery, setSearchQuery] = useState('');

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

  // Extract available filter options from all classifications
  const availableFilters = useMemo(
    () => data?.classification?.classifications 
      ? extractFilterOptions(data.classification.classifications)
      : {
          vendedor: [],
          cerrada: ['all'] as ('true' | 'false' | 'all')[],
          industria: [],
          fuente: [],
          volumen: [],
          dolorPrincipal: [],
          madurezTech: [],
          urgencia: [],
        },
    [data]
  );

  // Apply filters to get filtered classifications
  const filteredByFilters = useMemo(
    () => data?.classification?.classifications
      ? applyFilters(data.classification.classifications, activeFilters)
      : [],
    [data, activeFilters]
  );

  // Apply search filter to filtered classifications
  const filteredClassifications = useMemo(
    () => searchClientsByName(filteredByFilters, searchQuery),
    [filteredByFilters, searchQuery]
  );

  // Calculate statistics based on filtered data
  const totalFilteredClients = filteredClassifications.length;
  const closedCount = filteredClassifications.filter(
    (client) => client.isClosed === true
  ).length;
  const closurePercentage = totalFilteredClients > 0 
    ? ((closedCount / totalFilteredClients) * 100).toFixed(1)
    : '0.0';


  // Handle filter changes
  const handleFilterChange = useCallback((filterType: keyof FilterOptions, value: string[]) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: value,
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

  // Handle search change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  if (isLoading || !data || !data.classification) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Cargando leads...</p>
      </div>
    );
  }

  const { classification } = data;

  return (
    <div className={styles.leads}>
      <Header
        title="Tabla de Leads"
        subtitle={`Análisis de ${classification.totalClients} leads procesados y clasificados con IA`}
        titleIcon={Sparkles}
      />

      {/* Filters Section */}
      <Filters
        availableFilters={availableFilters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Stats Cards */}
      <div className={styles.statsContainer}>
        <StatCard 
          icon={Users}
          label="Total de Leads"
          value={totalFilteredClients}
        />
        <StatCard 
          icon={Lock}
          label="Leads Cerrados"
          value={closedCount}
        />
        <StatCard 
          icon={CheckCircle}
          label="Porcentaje de Cierres"
          value={`${closurePercentage}%`}
        />
      </div>

      {/* Search Section */}
      <Searcher onSearchChange={handleSearchChange} />

      {/* Classifications Table */}
      <div className={styles.tableSection}>
        <ClassificationTable classifications={filteredClassifications} />
      </div>
    </div>
  );
}

