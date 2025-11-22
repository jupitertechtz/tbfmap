// Export utility functions for player statistics

// Export to CSV
export const exportToCSV = (data, filename = 'player-statistics') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'Player Name',
    'Team',
    'Position',
    'Jersey Number',
    'Games Played',
    'Points Per Game',
    'Rebounds Per Game',
    'Assists Per Game',
    'Steals Per Game',
    'Blocks Per Game',
    'Field Goal %',
    '3-Point %',
    'Free Throw %',
    'Efficiency Rating'
  ];

  // Convert data to CSV rows
  const rows = data.map(player => [
    player?.name || '',
    player?.team?.name || 'No Team',
    player?.position || '',
    player?.jerseyNumber || '',
    player?.stats?.gamesPlayed || 0,
    player?.stats?.pointsPerGame || 0,
    player?.stats?.reboundsPerGame || 0,
    player?.stats?.assistsPerGame || 0,
    player?.stats?.stealsPerGame || 0,
    player?.stats?.blocksPerGame || 0,
    player?.stats?.fieldGoalPercentage || 0,
    player?.stats?.threePointPercentage || 0,
    player?.stats?.freeThrowPercentage || 0,
    player?.stats?.efficiency || 0
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape commas and quotes in cell values
      const cellValue = String(cell || '').replace(/"/g, '""');
      return `"${cellValue}"`;
    }).join(','))
  ].join('\n');

  // Create blob and download
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

// Export to Excel (using xlsx library)
export const exportToExcel = async (data, filename = 'player-statistics') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  try {
    // Dynamically import xlsx library
    const XLSX = await import('xlsx');

    // Prepare worksheet data
    const worksheetData = data.map(player => ({
      'Player Name': player?.name || '',
      'Team': player?.team?.name || 'No Team',
      'Position': player?.position || '',
      'Jersey Number': player?.jerseyNumber || '',
      'Games Played': player?.stats?.gamesPlayed || 0,
      'Points Per Game': player?.stats?.pointsPerGame || 0,
      'Rebounds Per Game': player?.stats?.reboundsPerGame || 0,
      'Assists Per Game': player?.stats?.assistsPerGame || 0,
      'Steals Per Game': player?.stats?.stealsPerGame || 0,
      'Blocks Per Game': player?.stats?.blocksPerGame || 0,
      'Field Goal %': player?.stats?.fieldGoalPercentage || 0,
      '3-Point %': player?.stats?.threePointPercentage || 0,
      'Free Throw %': player?.stats?.freeThrowPercentage || 0,
      'Efficiency Rating': player?.stats?.efficiency || 0
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Player Statistics');

    // Generate Excel file and download
    XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Failed to export to Excel. Please install xlsx library: npm install xlsx');
  }
};

// Export to PDF (using jsPDF library)
export const exportToPDF = async (data, filename = 'player-statistics', filters = {}) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  try {
    // Dynamically import jsPDF library
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Set up PDF document
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const startY = margin + 20;
    let currentY = startY;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Player Statistics Report', margin, currentY);
    currentY += 10;

    // Filters info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (filters.season && filters.season !== 'career') {
      doc.text(`Season: ${filters.season}`, margin, currentY);
      currentY += 5;
    }
    if (filters.team && filters.team !== 'all') {
      doc.text(`Team: ${filters.team}`, margin, currentY);
      currentY += 5;
    }
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, currentY);
    currentY += 10;

    // Table headers
    const headers = [
      'Player',
      'Team',
      'Pos',
      'GP',
      'PPG',
      'RPG',
      'APG',
      'FG%',
      'EFF'
    ];
    
    const colWidths = [50, 40, 15, 15, 15, 15, 15, 15, 15];
    const headerX = margin;
    let headerXPos = headerX;

    // Draw header row
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    headers.forEach((header, index) => {
      doc.text(header, headerXPos, currentY);
      headerXPos += colWidths[index];
    });
    currentY += 8;

    // Draw line under header
    doc.setLineWidth(0.5);
    doc.line(margin, currentY - 3, pageWidth - margin, currentY - 3);
    currentY += 2;

    // Table data
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    data.forEach((player, index) => {
      // Check if we need a new page
      if (currentY > pageHeight - 30) {
        doc.addPage();
        currentY = margin + 10;
        
        // Redraw headers on new page
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        headerXPos = headerX;
        headers.forEach((header, idx) => {
          doc.text(header, headerXPos, currentY);
          headerXPos += colWidths[idx];
        });
        currentY += 8;
        doc.line(margin, currentY - 3, pageWidth - margin, currentY - 3);
        currentY += 2;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
      }

      const rowData = [
        (player?.name || '').substring(0, 20),
        (player?.team?.name || 'N/A').substring(0, 15),
        player?.position?.substring(0, 3) || '',
        player?.stats?.gamesPlayed || 0,
        (player?.stats?.pointsPerGame || 0).toFixed(1),
        (player?.stats?.reboundsPerGame || 0).toFixed(1),
        (player?.stats?.assistsPerGame || 0).toFixed(1),
        (player?.stats?.fieldGoalPercentage || 0).toFixed(1) + '%',
        (player?.stats?.efficiency || 0).toFixed(1)
      ];

      headerXPos = headerX;
      rowData.forEach((cell, cellIndex) => {
        doc.text(String(cell), headerXPos, currentY);
        headerXPos += colWidths[cellIndex];
      });
      currentY += 6;
    });

    // Save PDF
    doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Failed to export to PDF. Please install jspdf library: npm install jspdf');
  }
};

