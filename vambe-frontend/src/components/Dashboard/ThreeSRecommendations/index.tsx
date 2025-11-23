'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Lightbulb, XCircle, TrendingUp, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import styles from './styles.module.css';
import { generateThreeS } from '@/server/three-s';
import { ThreeSRecommendations } from '@/server/interfaces';
import { ThreeSRecommendationsProps } from './interfaces';
import { calculateClassificationsHash, getCachedRecommendations, saveCachedRecommendations } from '@/utils/three-s';
import ThreeSTooltip from './Tooltip';
import Modal from './Modal';

export default function ThreeSRecommendationsComponent({
  classifications,
}: ThreeSRecommendationsProps) {
  const [recommendations, setRecommendations] =
    useState<ThreeSRecommendations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<{
    category: 'start' | 'stop' | 'spiceUp';
    index: number;
  } | null>(null);

  const handleCloseModal = useCallback(() => {
    setOpenModal(null);
  }, []);

  const currentHash = useMemo(
    () => calculateClassificationsHash(classifications),
    [classifications],
  );

  useEffect(() => {
    if (classifications.length === 0) {
      setRecommendations(null);
      return;
    }

    const cached = getCachedRecommendations(currentHash);
    if (cached) {
      setRecommendations(cached);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await generateThreeS(classifications);
        setRecommendations(result);
        saveCachedRecommendations(currentHash, result);
      } catch (err) {
        console.error('Error generating 3S recommendations:', err);
        setError('Error al generar recomendaciones. Intenta nuevamente.');
        setRecommendations(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [classifications, currentHash]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.titleSection}>
          <div className={styles.titleWrapper}>
            <Sparkles className={styles.titleIcon} />
            <h2 className={styles.title}>Recomendaciones &quot;Three S&quot;</h2>
          </div>
        </div>
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.spinner} />
          <p className={styles.loadingText}>Generando recomendaciones con IA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.titleSection}>
          <div className={styles.titleWrapper}>
            <Sparkles className={styles.titleIcon} />
            <h2 className={styles.title}>Recomendaciones &quot;Three S&quot;</h2>
          </div>
        </div>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <div className={styles.titleWrapper}>
          <Sparkles className={styles.titleIcon} />
          <h2 className={styles.title}>Recomendaciones &quot;Three S&quot;</h2>
        </div>
      </div>

      <div className={styles.recommendationsGrid}>
        {/* START */}
        <div className={styles.recommendationCard}>
          <ThreeSTooltip category="start" />
          <div className={styles.cardHeader}>
            <div className={`${styles.iconWrapper} ${styles.startIcon}`}>
              <Lightbulb className={styles.icon} />
            </div>
            <h3 className={styles.cardTitle}>Start</h3>
          </div>
          <ul className={styles.recommendationList}>
            {recommendations.start.map((item, index) => (
              <li key={index} className={styles.recommendationItem}>
                <div className={styles.recommendationHeader}>
                  <span className={styles.recommendationTitle}>{item.title}</span>
                  <button
                    onClick={() => setOpenModal({ category: 'start', index })}
                    className={`${styles.viewButton} ${styles.viewButtonStart}`}
                    aria-label="Ver recomendación completa"
                    type="button"
                  >
                    Ver más
                    <ChevronRight className={styles.chevronIcon} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* STOP */}
        <div className={styles.recommendationCard}>
          <ThreeSTooltip category="stop" />
          <div className={styles.cardHeader}>
            <div className={`${styles.iconWrapper} ${styles.stopIcon}`}>
              <XCircle className={styles.icon} />
            </div>
            <h3 className={styles.cardTitle}>Stop</h3>
          </div>
          <ul className={styles.recommendationList}>
            {recommendations.stop.map((item, index) => (
              <li key={index} className={styles.recommendationItem}>
                <div className={styles.recommendationHeader}>
                  <span className={styles.recommendationTitle}>{item.title}</span>
                  <button
                    onClick={() => setOpenModal({ category: 'stop', index })}
                    className={`${styles.viewButton} ${styles.viewButtonStop}`}
                    aria-label="Ver recomendación completa"
                    type="button"
                  >
                    Ver más
                    <ChevronRight className={styles.chevronIcon} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* SPICE UP */}
        <div className={styles.recommendationCard}>
          <ThreeSTooltip category="spiceUp" />
          <div className={styles.cardHeader}>
            <div className={`${styles.iconWrapper} ${styles.spiceUpIcon}`}>
              <TrendingUp className={styles.icon} />
            </div>
            <h3 className={styles.cardTitle}>Spice Up</h3>
          </div>
          <ul className={styles.recommendationList}>
            {recommendations.spiceUp.map((item, index) => (
              <li key={index} className={styles.recommendationItem}>
                <div className={styles.recommendationHeader}>
                  <span className={styles.recommendationTitle}>{item.title}</span>
                  <button
                    onClick={() => setOpenModal({ category: 'spiceUp', index })}
                    className={`${styles.viewButton} ${styles.viewButtonSpiceUp}`}
                    aria-label="Ver recomendación completa"
                    type="button"
                  >
                    Ver más
                    <ChevronRight className={styles.chevronIcon} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal */}
      {openModal && (
        <Modal
          title={
            recommendations[openModal.category][openModal.index].title
          }
          description={
            recommendations[openModal.category][openModal.index].description
          }
          onClose={handleCloseModal}
          category={openModal.category}
        />
      )}
    </div>
  );
}
