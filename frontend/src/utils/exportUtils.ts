import type { MovieLog } from '../features/movies/types/movie'
import { formatDate } from '../shared/utils/date'

export function exportToCSV(movies: MovieLog[], filename: string = 'movies-export.csv') {
  // Define CSV headers
  const headers = [
    'Title',
    'Director',
    'Year',
    'Genre',
    'Status',
    'Rating',
    'Platform',
    'Start Date',
    'End Date',
    'Is Rewatch',
    'Rewatch Count',
    'Current Timestamp',
    'Comments',
    'Created At',
    'Updated At'
  ]

  // Convert movies to CSV rows
  const rows = movies.map(movie => [
    escapeCSV(movie.title),
    escapeCSV(movie.director || ''),
    movie.year || '',
    escapeCSV(movie.genre || ''),
    movie.status,
    movie.rating || '',
    escapeCSV(movie.platform || ''),
    movie.start_date || '',
    movie.end_date || '',
    movie.is_rewatch ? 'Yes' : 'No',
    movie.rewatch_count || 0,
    movie.current_timestamp || '',
    '', // Comments placeholder (would need to fetch from sessions)
    movie.created_at,
    movie.updated_at
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Create and download file
  downloadFile(csvContent, filename, 'text/csv')
}

export function exportToPDF(movies: MovieLog[]) {
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Movies Export</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        h1 {
          color: #4f46e5;
          border-bottom: 2px solid #4f46e5;
          padding-bottom: 10px;
        }
        .export-info {
          margin: 20px 0;
          padding: 10px;
          background: #f3f4f6;
          border-radius: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background: #4f46e5;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        tr:nth-child(even) {
          background: #f9fafb;
        }
        tr:hover {
          background: #f3f4f6;
        }
        .status-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-watching { background: #dbeafe; color: #1e40af; }
        .status-completed { background: #d1fae5; color: #065f46; }
        .status-paused { background: #fef3c7; color: #92400e; }
        .status-rewatching { background: #e9d5ff; color: #6b21a8; }
        .rating {
          color: #f59e0b;
          font-weight: 600;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>Movies Export</h1>
      <div class="export-info">
        <strong>Export Date:</strong> ${new Date().toLocaleString()}<br>
        <strong>Total Movies:</strong> ${movies.length}
      </div>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Director</th>
            <th>Year</th>
            <th>Genre</th>
            <th>Status</th>
            <th>Rating</th>
            <th>Started</th>
            <th>Finished</th>
          </tr>
        </thead>
        <tbody>
          ${movies.map(movie => `
            <tr>
              <td>
                <strong>${escapeHTML(movie.title)}</strong>
                ${movie.is_rewatch ? '<br><small>(Rewatch)</small>' : ''}
              </td>
              <td>${escapeHTML(movie.director || '-')}</td>
              <td>${movie.year || '-'}</td>
              <td>${escapeHTML(movie.genre || '-')}</td>
              <td>
                <span class="status-badge status-${movie.status}">
                  ${movie.status}
                </span>
              </td>
              <td class="rating">${movie.rating ? `★ ${movie.rating}/10` : '-'}</td>
              <td>${movie.start_date ? formatDate(movie.start_date, { year: 'numeric', month: 'short', day: 'numeric' }, 'en-US') : '-'}</td>
              <td>${movie.end_date ? formatDate(movie.end_date, { year: 'numeric', month: 'short', day: 'numeric' }, 'en-US') : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `

  // Open print dialog
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print()
    }
  }
}

// Helper functions
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function escapeHTML(value: string): string {
  const div = document.createElement('div')
  div.textContent = value
  return div.innerHTML
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
