// Export utility functions for league fixtures

// Export fixtures to CSV
export const exportFixturesToCSV = (fixtures, leagueName, filename = 'league-fixtures') => {
  if (!fixtures || fixtures.length === 0) {
    alert('No fixtures to export');
    return;
  }

  const headers = [
    'Date',
    'Time',
    'Home Team',
    'Away Team',
    'Venue',
    'Status',
    'Home Score',
    'Away Score'
  ];

  const rows = fixtures.map(fixture => {
    const date = fixture.scheduledDate ? new Date(fixture.scheduledDate) : null;
    return [
      date ? date.toLocaleDateString() : '',
      date ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
      fixture.homeTeam?.name || 'TBD',
      fixture.awayTeam?.name || 'TBD',
      fixture.venue || 'TBD',
      fixture.matchStatus || 'scheduled',
      fixture.homeScore || '',
      fixture.awayScore || ''
    ];
  });

  const csvContent = [
    `League: ${leagueName}`,
    `Generated: ${new Date().toLocaleDateString()}`,
    '',
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      const cellValue = String(cell || '').replace(/"/g, '""');
      return `"${cellValue}"`;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Export fixtures to Excel
export const exportFixturesToExcel = async (fixtures, leagueName, filename = 'league-fixtures') => {
  if (!fixtures || fixtures.length === 0) {
    alert('No fixtures to export');
    return;
  }

  try {
    const XLSX = await import('xlsx');

    const worksheetData = fixtures.map(fixture => {
      const date = fixture.scheduledDate ? new Date(fixture.scheduledDate) : null;
      return {
        'Date': date ? date.toLocaleDateString() : '',
        'Time': date ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
        'Home Team': fixture.homeTeam?.name || 'TBD',
        'Away Team': fixture.awayTeam?.name || 'TBD',
        'Venue': fixture.venue || 'TBD',
        'Status': fixture.matchStatus || 'scheduled',
        'Home Score': fixture.homeScore || '',
        'Away Score': fixture.awayScore || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fixtures');
    XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Failed to export to Excel');
  }
};

// Export fixtures to PDF
export const exportFixturesToPDF = async (fixtures, leagueName, filename = 'league-fixtures') => {
  if (!fixtures || fixtures.length === 0) {
    alert('No fixtures to export');
    return;
  }

  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(leagueName || 'League Fixtures', 14, 22);

    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Matches: ${fixtures.length}`, 14, 36);

    // Table setup
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const startY = 45;
    let currentY = startY;
    const rowHeight = 8;
    const colWidths = [25, 20, 40, 40, 35, 25, 20];
    const headers = ['Date', 'Time', 'Home Team', 'Away Team', 'Venue', 'Status', 'Score'];
    
    // Draw header row
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    let headerX = margin;
    headers.forEach((header, index) => {
      // Draw header background
      doc.setFillColor(28, 100, 242);
      doc.rect(headerX, currentY - 5, colWidths[index], rowHeight, 'F');
      // Draw header text
      doc.setTextColor(255, 255, 255);
      doc.text(header, headerX + 2, currentY);
      headerX += colWidths[index];
    });
    
    currentY += rowHeight;
    doc.setTextColor(0, 0, 0);
    
    // Draw table data
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    fixtures.forEach((fixture, index) => {
      // Check if we need a new page
      if (currentY > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        currentY = margin + 10;
        
        // Redraw headers on new page
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        headerX = margin;
        headers.forEach((header, idx) => {
          doc.setFillColor(28, 100, 242);
          doc.rect(headerX, currentY - 5, colWidths[idx], rowHeight, 'F');
          doc.setTextColor(255, 255, 255);
          doc.text(header, headerX + 2, currentY);
          headerX += colWidths[idx];
        });
        currentY += rowHeight;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
      }
      
      const date = fixture.scheduledDate ? new Date(fixture.scheduledDate) : null;
      const rowData = [
        date ? date.toLocaleDateString() : 'TBD',
        date ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD',
        (fixture.homeTeam?.name || 'TBD').substring(0, 20),
        (fixture.awayTeam?.name || 'TBD').substring(0, 20),
        (fixture.venue || 'TBD').substring(0, 15),
        fixture.matchStatus || 'scheduled',
        fixture.matchStatus === 'completed' || fixture.matchStatus === 'live' 
          ? `${fixture.homeScore || 0} - ${fixture.awayScore || 0}`
          : '-'
      ];
      
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(243, 244, 246);
        doc.rect(margin, currentY - 5, pageWidth - (margin * 2), rowHeight, 'F');
      }
      
      // Draw borders
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, currentY - 5, pageWidth - (margin * 2), rowHeight, 'S');
      
      // Draw cell content
      headerX = margin;
      rowData.forEach((cell, cellIndex) => {
        doc.text(String(cell), headerX + 2, currentY);
        // Draw vertical line
        if (cellIndex < headers.length - 1) {
          doc.line(headerX + colWidths[cellIndex], currentY - 5, headerX + colWidths[cellIndex], currentY + 3);
        }
        headerX += colWidths[cellIndex];
      });
      
      currentY += rowHeight;
    });

    doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Failed to export to PDF');
  }
};

// Export fixtures to Word (using HTML approach)
export const exportFixturesToWord = (fixtures, leagueName, filename = 'league-fixtures') => {
  if (!fixtures || fixtures.length === 0) {
    alert('No fixtures to export');
    return;
  }

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${leagueName || 'League Fixtures'}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h1 {
          color: #1c64f2;
          margin-bottom: 10px;
        }
        .info {
          color: #6b7280;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #1c64f2;
          color: white;
          padding: 10px;
          text-align: left;
          border: 1px solid #ddd;
        }
        td {
          padding: 8px;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f3f4f6;
        }
      </style>
    </head>
    <body>
      <h1>${leagueName || 'League Fixtures'}</h1>
      <div class="info">
        <p>Generated: ${new Date().toLocaleDateString()}</p>
        <p>Total Matches: ${fixtures.length}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Home Team</th>
            <th>Away Team</th>
            <th>Venue</th>
            <th>Status</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
  `;

  fixtures.forEach(fixture => {
    const date = fixture.scheduledDate ? new Date(fixture.scheduledDate) : null;
    const score = fixture.matchStatus === 'completed' || fixture.matchStatus === 'live'
      ? `${fixture.homeScore || 0} - ${fixture.awayScore || 0}`
      : '-';
    
    htmlContent += `
      <tr>
        <td>${date ? date.toLocaleDateString() : 'TBD'}</td>
        <td>${date ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</td>
        <td>${fixture.homeTeam?.name || 'TBD'}</td>
        <td>${fixture.awayTeam?.name || 'TBD'}</td>
        <td>${fixture.venue || 'TBD'}</td>
        <td>${fixture.matchStatus || 'scheduled'}</td>
        <td>${score}</td>
      </tr>
    `;
  });

  htmlContent += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  // Create blob and download
  const blob = new Blob([htmlContent], { type: 'application/msword' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.doc`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

