'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './styles.module.css';
import { ClassificationTableProps, ClientClassification } from './interfaces';

const ITEMS_PER_PAGE = 10;

export default function ClassificationTable({ classifications }: ClassificationTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calcular paginación
  const totalPages = Math.ceil(classifications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentClassifications = classifications.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.tableHeader}>Nombre</th>
              <th className={styles.tableHeader}>Email</th>
              <th className={styles.tableHeader}>Teléfono</th>
              <th className={styles.tableHeader}>Fecha de Reunión</th>
              <th className={styles.tableHeader}>Vendedor</th>
              <th className={styles.tableHeader}>Cerrada</th>
              <th className={styles.tableHeader}>Industria</th>
              <th className={styles.tableHeader}>Fuente</th>
              <th className={styles.tableHeader}>Volumen</th>
              <th className={styles.tableHeader}>Dolor Principal</th>
              <th className={styles.tableHeader}>Madurez Tech</th>
              <th className={styles.tableHeader}>Urgencia</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {currentClassifications.map((client: ClientClassification, index: number) => (
              <tr key={index} className={styles.tableRow}>
                <td className={styles.tableCell}>
                  <span className={styles.clientName}>{client.clientName}</span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.emailText}>{client.email}</span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.phoneText}>{client.phone || 'N/A'}</span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.dateText}>{client.meetingDate ? formatDate(client.meetingDate) : 'N/A'}</span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.salespersonText}>{client.assignedSalesperson || 'N/A'}</span>
                </td>
                <td className={styles.tableCell}>
                  <span className={`${styles.closedBadge} ${client.isClosed ? styles.closedYes : styles.closedNo}`}>
                    {client.isClosed ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.badge}>{client.industry}</span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.badge}>{client.leadSource}</span>
                </td>
                <td className={styles.tableCell}>
                  <span className={`${styles.volumeBadge} ${getVolumeClass(client.interactionVolume)}`}>
                    {client.interactionVolume}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.badge}>{client.mainPainPoint}</span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.badge}>{client.techMaturity}</span>
                </td>
                <td className={styles.tableCell}>
                  <span className={`${styles.urgencyBadge} ${getUrgencyClass(client.urgency)}`}>
                    {client.urgency}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            <ChevronLeft className={styles.paginationIcon} />
            Anterior
          </button>

          <div className={styles.paginationPages}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageClick(page)}
                className={`${styles.paginationPageButton} ${
                  currentPage === page ? styles.paginationPageButtonActive : ''
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            Siguiente
            <ChevronRight className={styles.paginationIcon} />
          </button>
        </div>
      )}
    </div>
  );
}

// Helper functions for styling
function getVolumeClass(volume: string): string {
  const lowerVolume = volume.toLowerCase();
  if (lowerVolume.includes('alto') || lowerVolume.includes('high')) {
    return styles.volumeHigh;
  } else if (lowerVolume.includes('medio') || lowerVolume.includes('medium')) {
    return styles.volumeMedium;
  }
  return styles.volumeLow;
}

function getUrgencyClass(urgency: string): string {
  const lowerUrgency = urgency.toLowerCase();
  if (lowerUrgency.includes('alto') || lowerUrgency.includes('alta') || lowerUrgency.includes('high')) {
    return styles.urgencyHigh;
  } else if (lowerUrgency.includes('medio') || lowerUrgency.includes('media') || lowerUrgency.includes('medium')) {
    return styles.urgencyMedium;
  }
  return styles.urgencyLow;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return dateString;
  }
}

