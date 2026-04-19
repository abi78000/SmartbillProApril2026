import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';

import { ReportService } from '../report.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { ViewDatatableComponent } from '../../components/view-datatable/view-datatable.component';
import { IconsModule } from '../../../shared/icons.module';
import { AuthService } from '../../../authentication/auth-service.service';
import { GSTFiling } from '../models/terminal-report';

@Component({
  selector: 'app-gst-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ViewDatatableComponent,
    IconsModule
  ],
  templateUrl: './gst-report.component.html',
  styleUrl: './gst-report.component.css'
})
export class GstReportComponent implements OnInit {

  loading = false;

  /* ================= FILTERS ================= */
  filters = {
    fromDate: '',
    toDate: '',
    companyId: null as number | null,
    branchId: null as number | null,
    gstFileType: 'B2B' as 'B2B' | 'B2C' | 'HSN'
  };

  /* ================= DROPDOWNS ================= */
  companies: any[] = [];
  branches: any[] = [];

  /* ================= DATA ================= */
  gstData: GSTFiling[] = [];

  /* ================= KPI TOTALS ================= */
  totalInvoiceValue = 0;
  totalTaxableValue = 0;
  totalCGST = 0;
  totalSGST = 0;
  totalIGST = 0;
  totalGST = 0;

  /* ================= TABLE COLUMNS ================= */
  columns: any[] = [];

  constructor(
    private reportService: ReportService,
    private commonService: CommonserviceService,
    private authService: AuthService
  ) {}

  /* ================= INIT ================= */
  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];

    this.filters.fromDate = today;
    this.filters.toDate = today;
    this.filters.companyId = this.authService.companyId;

    this.loadDropdowns();
    this.loadReport();
  }

  /* ================= DROPDOWNS ================= */
  loadDropdowns(): void {
    const companyId = this.filters.companyId;

    forkJoin({
      companies: this.commonService.getCompanies(),
      branches: companyId
        ? this.commonService.getBranchesByCompany(companyId)
        : of([])
    }).subscribe(res => {
      this.companies = res.companies ?? [];
      this.branches = res.branches ?? [];
    });
  }

  onCompanyChange(): void {
    this.filters.branchId = null;

    if (this.filters.companyId) {
      this.commonService
        .getBranchesByCompany(this.filters.companyId)
        .subscribe(b => (this.branches = b ?? []));
    }

    this.loadReport();
  }

  onFilterChange(): void {
    this.loadReport();
  }

  /* ================= REPORT LOAD ================= */
  loadReport(): void {
    if (!this.filters.companyId) return;

    this.loading = true;

    this.reportService.getGSTFiling(
      this.filters.companyId,
      this.filters.gstFileType,
      this.filters.branchId ?? undefined,
      this.filters.fromDate || undefined,
      this.filters.toDate || undefined
    ).subscribe({
      next: res => {
        this.gstData = res ?? [];
        this.updateColumnsByType();   // 🔥 FIX ALIGNMENT
        this.calculateTotals();
        this.loading = false;
      },
      error: err => {
        console.error('GST Report Error', err);
        this.gstData = [];
        this.resetTotals();
        this.loading = false;
      }
    });
  }

  /* ================= COLUMN SWITCH ================= */
  private updateColumnsByType(): void {

    if (this.filters.gstFileType === 'HSN') {
      this.columns = [
        { header: 'HSN Code', field: 'hsnCode', visible: true },
        { header: 'Description', field: 'hsnDescription', visible: true },
        { header: 'Quantity', field: 'totalQuantity', visible: true },
        { header: 'Taxable Value', field: 'taxableValue', visible: true },
        { header: 'CGST', field: 'cgstAmount', visible: true },
        { header: 'SGST', field: 'sgstAmount', visible: true },
        { header: 'IGST', field: 'igstAmount', visible: true },
        { header: 'Invoice Value', field: 'invoiceValue', visible: true }
      ];
    } 
    else {
      // B2B / B2C
      this.columns = [
        { header: 'Invoice No', field: 'invoiceNo', visible: true },
        { header: 'Invoice Date', field: 'invoiceDate', visible: true },
        { header: 'GSTIN', field: 'recipientGSTIN', visible: true },
        { header: 'Taxable Value', field: 'taxableValue', visible: true },
        { header: 'CGST', field: 'cgstAmount', visible: true },
        { header: 'SGST', field: 'sgstAmount', visible: true },
        { header: 'IGST', field: 'igstAmount', visible: true },
        { header: 'Invoice Value', field: 'invoiceValue', visible: true }
      ];
    }
  }

  /* ================= KPI CALCULATION ================= */
  private calculateTotals(): void {
    this.resetTotals();

    for (const r of this.gstData) {
      this.totalInvoiceValue += r.invoiceValue || 0;
      this.totalTaxableValue += r.taxableValue || 0;
      this.totalCGST += r.cgstAmount || 0;
      this.totalSGST += r.sgstAmount || 0;
      this.totalIGST += r.igstAmount || 0;
    }

    this.totalGST = this.totalCGST + this.totalSGST + this.totalIGST;
  }

  private resetTotals(): void {
    this.totalInvoiceValue = 0;
    this.totalTaxableValue = 0;
    this.totalCGST = 0;
    this.totalSGST = 0;
    this.totalIGST = 0;
    this.totalGST = 0;
  }

  /* ================= UI ACTIONS ================= */
  onRefresh(): void {
    this.loadReport();
  }

  onClearFilters(): void {
    const today = new Date().toISOString().split('T')[0];

    this.filters.fromDate = today;
    this.filters.toDate = today;
    this.filters.branchId = null;
    this.filters.gstFileType = 'B2B';

    this.loadReport();
  }

  onExport(): void {
    // Hook for Excel / CSV / PDF export
    console.log('Export clicked');
  }

  /* ================= HELPERS ================= */
  get visibleColumns() {
    return this.columns.filter(c => c.visible !== false);
  }
}
