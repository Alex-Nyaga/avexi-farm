import React from 'react';
import { useApp } from '../context/AppContext';
import { ksh, fd } from '../utils/helpers';

const Reports = () => {
  const { db } = useApp();

  const generateLivestockPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Avexi Farm - Livestock Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    
    // Cows Section
    doc.setFontSize(14);
    doc.text('Cows', 14, 40);
    doc.setFontSize(10);
    
    const cowData = db.cows.map(cow => [
      cow.tag,
      cow.breed || cow.species || '—',
      cow.sex || '—',
      cow.status,
      cow.weight ? `${cow.weight} kg` : '—'
    ]);
    
    doc.autoTable({
      startY: 45,
      head: [['Tag', 'Breed', 'Sex', 'Status', 'Weight']],
      body: cowData,
      theme: 'grid',
      headStyles: { fillColor: [26, 74, 122] }
    });
    
    // Sheep Section
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Sheep', 14, finalY);
    doc.setFontSize(10);
    
    const sheepData = db.sheep.map(sheep => [
      sheep.tag,
      sheep.breed || sheep.species || '—',
      sheep.sex || '—',
      sheep.status,
      sheep.weight ? `${sheep.weight} kg` : '—'
    ]);
    
    doc.autoTable({
      startY: finalY + 5,
      head: [['Tag', 'Breed', 'Sex', 'Status', 'Weight']],
      body: sheepData,
      theme: 'grid',
      headStyles: { fillColor: [122, 75, 26] }
    });
    
    doc.save('livestock-report.pdf');
  };

  const generateMilkPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Avexi Farm - Milk Production Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    
    const milkData = db.milkRecords.map(record => [
      fd(record.date),
      record.cowTag || '—',
      record.am || 0,
      record.pm || 0,
      (Number(record.am || 0) + Number(record.pm || 0)).toFixed(1)
    ]);
    
    doc.autoTable({
      startY: 40,
      head: [['Date', 'Cow', 'AM (L)', 'PM (L)', 'Total (L)']],
      body: milkData,
      theme: 'grid',
      headStyles: { fillColor: [26, 74, 122] }
    });
    
    // Summary
    const totalMilk = db.milkRecords.reduce((sum, r) => sum + Number(r.am || 0) + Number(r.pm || 0), 0);
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.text(`Total Milk Production: ${totalMilk.toFixed(1)} litres`, 14, finalY);
    
    doc.save('milk-report.pdf');
  };

  const generateFinancialPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Avexi Farm - Financial Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    
    const inc = db.transactions.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
    const exp = db.transactions.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
    
    // Summary
    doc.setFontSize(12);
    doc.text('Financial Summary', 14, 40);
    doc.setFontSize(10);
    doc.text(`Total Income: ${ksh(inc)}`, 14, 48);
    doc.text(`Total Expenses: ${ksh(exp)}`, 14, 54);
    doc.text(`Net Balance: ${ksh(inc - exp)}`, 14, 60);
    
    // Transactions
    const transactionData = db.transactions.map(tx => [
      fd(tx.date),
      tx.type,
      tx.category || '—',
      tx.desc || '—',
      ksh(tx.amount)
    ]);
    
    doc.autoTable({
      startY: 70,
      head: [['Date', 'Type', 'Category', 'Description', 'Amount']],
      body: transactionData,
      theme: 'grid',
      headStyles: { fillColor: [75, 26, 122] }
    });
    
    doc.save('financial-report.pdf');
  };

  const generateStaffPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Avexi Farm - Staff Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    
    const staffData = db.staff.map(member => [
      member.name,
      member.role || '—',
      member.phone || '—',
      member.monthlySalary ? `KES ${Number(member.monthlySalary).toLocaleString()}` : '—',
      member.status
    ]);
    
    doc.autoTable({
      startY: 40,
      head: [['Name', 'Role', 'Phone', 'Salary', 'Status']],
      body: staffData,
      theme: 'grid',
      headStyles: { fillColor: [136, 136, 136] }
    });
    
    doc.save('staff-report.pdf');
  };

  const generateCropPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Avexi Farm - Crop Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    
    const seasonData = db.plotSeasons.map(season => [
      season.plotName || season.plotId,
      season.variety || '—',
      fd(season.plantedDate),
      season.status
    ]);
    
    doc.autoTable({
      startY: 40,
      head: [['Plot', 'Variety', 'Planted', 'Status']],
      body: seasonData,
      theme: 'grid',
      headStyles: { fillColor: [58, 107, 26] }
    });
    
    doc.save('crop-report.pdf');
  };

  return (
    <div>
      <div className="page-hdr">
        <div className="page-title">Reports & PDF</div>
      </div>
      <div className="card">
        <div className="card-title">Available Reports</div>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div 
            className="card" 
            style={{ cursor: 'pointer', marginBottom: 0 }} 
            onClick={generateLivestockPDF}
          >
            <div className="card-title">Livestock Report</div>
            <div className="card-sub">Complete overview of cows and sheep</div>
          </div>
          <div 
            className="card" 
            style={{ cursor: 'pointer', marginBottom: 0 }} 
            onClick={generateMilkPDF}
          >
            <div className="card-title">Milk Production Report</div>
            <div className="card-sub">Daily milk records and totals</div>
          </div>
          <div 
            className="card" 
            style={{ cursor: 'pointer', marginBottom: 0 }} 
            onClick={generateCropPDF}
          >
            <div className="card-title">Crop Report</div>
            <div className="card-sub">Potato seasons and activities</div>
          </div>
          <div 
            className="card" 
            style={{ cursor: 'pointer', marginBottom: 0 }} 
            onClick={generateFinancialPDF}
          >
            <div className="card-title">Financial Report</div>
            <div className="card-sub">Income, expenses, and balance</div>
          </div>
          <div 
            className="card" 
            style={{ cursor: 'pointer', marginBottom: 0 }} 
            onClick={generateStaffPDF}
          >
            <div className="card-title">Staff Report</div>
            <div className="card-sub">Staff members and payments</div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">Quick Stats</div>
        <div className="stat-grid">
          <div className="stat">
            <div className="stat-label">Total Animals</div>
            <div className="stat-val">{db.cows.length + db.sheep.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Milk Records</div>
            <div className="stat-val">{db.milkRecords.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Transactions</div>
            <div className="stat-val">{db.transactions.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Vet Visits</div>
            <div className="stat-val">{db.vetVisits.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;