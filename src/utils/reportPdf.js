import { chartToImage } from './chartExport';

const GREEN = [31, 107, 53];
const INK = [16, 32, 26];
const MUTED = [95, 115, 104];

export const stamp = () =>
  new Date().toLocaleString('en-KE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

// Builds a branded A4 report: header band, who/when meta, KPI tiles,
// optional graphs and tables, a signature block, and a page footer.
export class ReportBuilder {
  constructor({ title, subtitle, user }) {
    const { jsPDF } = window.jspdf;
    this.doc = new jsPDF({ unit: 'mm', format: 'a4' });
    this.title = title;
    this.user = user;
    this.downloaded = stamp();
    this.w = this.doc.internal.pageSize.getWidth();
    this.h = this.doc.internal.pageSize.getHeight();
    this.margin = 14;
    this.drawHeader(subtitle);
  }

  drawHeader(subtitle) {
    const d = this.doc;
    d.setFillColor(...GREEN);
    d.rect(0, 0, this.w, 30, 'F');
    d.setTextColor(255, 255, 255);
    d.setFont('helvetica', 'bold');
    d.setFontSize(10);
    d.text('AVEXI FARM', this.margin, 11);
    d.setFontSize(19);
    d.text(this.title, this.margin, 21);
    d.setFont('helvetica', 'normal');
    d.setFontSize(9);
    if (subtitle) d.text(subtitle, this.w - this.margin, 21, { align: 'right' });

    d.setTextColor(...MUTED);
    d.setFontSize(9);
    d.text(`Prepared by: ${this.user.name || this.user.username}${this.user.role ? ` (${this.user.role})` : ''}`, this.margin, 38);
    d.text(`Downloaded: ${this.downloaded}`, this.w - this.margin, 38, { align: 'right' });
    d.setDrawColor(220, 228, 223);
    d.line(this.margin, 41, this.w - this.margin, 41);
    this.y = 49;
  }

  ensure(space) {
    if (this.y + space > this.h - 22) {
      this.doc.addPage();
      this.y = 20;
    }
  }

  heading(text) {
    this.ensure(14);
    this.doc.setTextColor(...INK);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text(text, this.margin, this.y);
    this.y += 6;
  }

  kpis(items) {
    this.ensure(24);
    const gap = 4;
    const bw = (this.w - this.margin * 2 - gap * (items.length - 1)) / items.length;
    items.forEach(([label, value], i) => {
      const x = this.margin + i * (bw + gap);
      this.doc.setFillColor(240, 246, 242);
      this.doc.setDrawColor(215, 226, 219);
      this.doc.roundedRect(x, this.y, bw, 20, 1.5, 1.5, 'FD');
      this.doc.setTextColor(...MUTED);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.text(String(label).toUpperCase(), x + 3, this.y + 7);
      this.doc.setTextColor(...INK);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(13);
      this.doc.text(String(value), x + 3, this.y + 15);
    });
    this.y += 27;
  }

  chart(cfg, heading) {
    const img = chartToImage(cfg);
    if (!img) return;
    if (heading) this.heading(heading);
    const iw = this.w - this.margin * 2;
    const ih = iw * (420 / 900);
    this.ensure(ih + 4);
    this.doc.addImage(img, 'PNG', this.margin, this.y, iw, ih);
    this.y += ih + 6;
  }

  table(head, body, heading) {
    if (heading) this.heading(heading);
    this.ensure(20);
    this.doc.autoTable({
      startY: this.y,
      head: [head],
      body: body.length ? body : [[{ content: 'No records', colSpan: head.length, styles: { halign: 'center', textColor: MUTED } }]],
      theme: 'striped',
      margin: { left: this.margin, right: this.margin, bottom: 22 },
      styles: { fontSize: 8.5, cellPadding: 2, textColor: INK },
      headStyles: { fillColor: GREEN, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 249, 246] }
    });
    this.y = this.doc.lastAutoTable.finalY + 8;
  }

  signatures() {
    this.ensure(46);
    const d = this.doc;
    this.heading('Sign-off');
    const colW = (this.w - this.margin * 2 - 10) / 2;
    const block = (x, role, printed) => {
      d.setDrawColor(...INK);
      d.setLineWidth(0.3);
      d.line(x, this.y + 16, x + colW, this.y + 16);
      d.setTextColor(...INK);
      d.setFont('helvetica', 'bold');
      d.setFontSize(9);
      d.text(role, x, this.y + 4);
      d.setFont('helvetica', 'normal');
      d.setTextColor(...MUTED);
      d.setFontSize(8);
      d.text(printed ? `Name: ${printed}` : 'Name: ______________________', x, this.y + 21);
      d.text('Signature', x, this.y + 25);
      d.text('Date: ____ / ____ / ________', x + colW - 44, this.y + 25);
    };
    block(this.margin, 'Prepared by', this.user.name || this.user.username);
    block(this.margin + colW + 10, 'Reviewed / approved by', '');
    this.y += 34;
  }

  save(filename) {
    const d = this.doc;
    const pages = d.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i += 1) {
      d.setPage(i);
      d.setDrawColor(220, 228, 223);
      d.line(this.margin, this.h - 14, this.w - this.margin, this.h - 14);
      d.setFont('helvetica', 'normal');
      d.setFontSize(7.5);
      d.setTextColor(...MUTED);
      d.text(`Avexi Farm · ${this.title} · downloaded ${this.downloaded} by ${this.user.name || this.user.username}`, this.margin, this.h - 9);
      d.text(`Page ${i} of ${pages}`, this.w - this.margin, this.h - 9, { align: 'right' });
    }
    d.save(filename);
  }
}
