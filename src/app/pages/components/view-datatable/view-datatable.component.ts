import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IconsModule } from '../../../shared/icons.module';

@Component({
  selector: 'app-view-datatable',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './view-datatable.component.html',
  styleUrl: './view-datatable.component.css',
})
export class ViewDatatableComponent implements OnChanges {
  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Input() loading: boolean = false;

  @Input() title = 'Data Table Export';
  @Input() companyName = 'Company Name';

  searchText = '';
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;

  filteredData: any[] = [];
  paginatedData: any[] = [];

  sortDirection: any = {};
  pages: number[] = [];

  ngOnChanges() {
    this.filteredData = [...this.data];
    this.updatePagination();
  }

  /* ----------------------- SEARCH ----------------------- */
  applySearch() {
    const s = this.searchText.toLowerCase();

    this.filteredData = this.data.filter((row) =>
      Object.values(row).some((val) =>
        (val ?? '').toString().toLowerCase().includes(s)
      )
    );

    this.currentPage = 1;
    this.updatePagination();
  }

  /* ----------------------- SORTING ----------------------- */
  sortBy(field: string) {
    const current = this.sortDirection[field] || 'asc';
    const next = current === 'asc' ? 'desc' : 'asc';

    this.sortDirection = { [field]: next };
    const dir = next === 'asc' ? 1 : -1;

    this.filteredData.sort((a, b) => (a[field] > b[field] ? dir : -dir));

    this.updatePagination();
  }

  /* ----------------------- PAGINATION ----------------------- */
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize) || 1;

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedData = this.filteredData.slice(start, end);

    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) {
      this.currentPage = p;
      this.updatePagination();
    }
  }

  onRowsChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  /* ----------------------- STATUS BADGE ----------------------- */
  getStatusClass(status: string): string {
    if (!status) return '';

    const s = status.toLowerCase();

    if (s.includes('pending') || s.includes('unqualified'))
      return 'badge-pending';

    if (s.includes('negotiation')) return 'badge-negotiation';

    if (s.includes('qualified') || s.includes('approved'))
      return 'badge-qualified';

    if (s.includes('new')) return 'badge-new';

    return '';
  }

  /* ----------------------- EXPORTS ----------------------- */
  exportExcel() {
    const exportData = this.filteredData.length ? this.filteredData : this.data;

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    saveAs(new Blob([buffer]), `table_export_${Date.now()}.xlsx`);
  }

  exportCSV() {
    const exportData = this.filteredData.length ? this.filteredData : this.data;

    const headers = this.columns.map((c) => c.header);
    const rows = exportData.map((row) =>
      this.columns.map((col) => `"${row[col.field] ?? ''}"`)
    );

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    saveAs(
      new Blob([csv], { type: 'text/csv' }),
      `table_export_${Date.now()}.csv`
    );
  }

  exportPDF() {
    const exportData = this.filteredData.length ? this.filteredData : this.data;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const generatedOn = new Date().toLocaleString();

    /* ================= HEADER ================= */
    const drawHeader = () => {
      doc.setFont('helvetica', 'bold'); // Arial-style
      doc.setFontSize(13);
      doc.text(this.companyName, 14, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(this.title, 14, 18);

      doc.setFontSize(8);
      doc.text(`Generated on: ${generatedOn}`, pageWidth - 14, 12, {
        align: 'right',
      });

      doc.setDrawColor(180);
      doc.setLineWidth(0.2);
      doc.line(14, 21, pageWidth - 14, 21);
    };

    /* ================= FOOTER ================= */
    const drawFooter = (pageNo: number) => {
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`Page ${pageNo}`, pageWidth / 2, pageHeight - 8, {
        align: 'center',
      });
    };

    /* ================= TABLE ================= */
    autoTable(doc, {
      startY: 26,

      head: [this.columns.map((c) => c.header)],
      body: exportData.map((row) =>
        this.columns.map((col) => row[col.field] ?? '')
      ),

      theme: 'grid',

      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 4,
        valign: 'middle',
        textColor: [33, 37, 41],
        lineWidth: 0.2,
        lineColor: [200, 200, 200],
      },

      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
      },

      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },

      margin: { left: 14, right: 14 },

      didDrawPage: () => {
        drawHeader();
        drawFooter(doc.getNumberOfPages());
      },
    });

    doc.save(`${this.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  }
}
