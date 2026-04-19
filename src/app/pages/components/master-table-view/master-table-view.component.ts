import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SharedModule } from '../../../shared/shared.module';
import { IconsModule } from '../../../shared/icons.module';
IconsModule
SharedModule

@Component({
  selector: 'app-master-table-view',
  standalone: true,
  imports: [CommonModule, FormsModule,SharedModule,IconsModule],
  templateUrl: './master-table-view.component.html',
  styleUrls: ['./master-table-view.component.css']
})
export class MasterTableViewComponent implements OnChanges {

  /* ================= INPUTS ================= */
  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Input() title = 'Master List';
  @Input() companyName = 'Company';

  /* ================= OUTPUTS ================= */
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  /* ================= SEARCH ================= */
  searchText = '';

  /* ================= PAGINATION ================= */
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];

  filteredData: any[] = [];
  paginatedData: any[] = [];

  /* ================= LIFECYCLE ================= */
  ngOnChanges(): void {
    this.filteredData = [...this.data];
    this.updatePagination();
  }

  /* ================= SEARCH ================= */
  applySearch() {
    const s = this.searchText.toLowerCase();

    this.filteredData = this.data.filter(row =>
      Object.values(row).some(val =>
        (val ?? '').toString().toLowerCase().includes(s)
      )
    );

    this.currentPage = 1;
    this.updatePagination();
  }

  /* ================= PAGINATION ================= */
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

  /* ================= ACTIONS ================= */
  onEdit(row: any) {
    this.edit.emit(row);
  }

  onDelete(row: any) {
    this.delete.emit(row);
  }

  /* ================= EXPORTS ================= */

  exportExcel() {
    const ws = XLSX.utils.json_to_sheet(this.filteredData.length ? this.filteredData : this.data);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    saveAs(new Blob([buffer]), `export_${Date.now()}.xlsx`);
  }

  exportCSV() {
    const exportData = this.filteredData.length ? this.filteredData : this.data;

    const headers = this.columns.map(c => c.header);
    const rows = exportData.map(row =>
      this.columns.map(col => `"${row[col.field] ?? ''}"`)
    );

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    saveAs(new Blob([csv], { type: 'text/csv' }), `export_${Date.now()}.csv`);
  }

  exportPDF() {
    const exportData = this.filteredData.length ? this.filteredData : this.data;

    const doc = new jsPDF({ orientation: 'landscape' });

    autoTable(doc, {
      head: [this.columns.map(c => c.header)],
      body: exportData.map(row => this.columns.map(col => row[col.field] ?? '')),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [29, 17, 96] }
    });

    doc.save(`export_${Date.now()}.pdf`);
  }
}
