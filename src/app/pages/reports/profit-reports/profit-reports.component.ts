import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';

import { ReportService } from '../report.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { ViewDatatableComponent } from '../../components/view-datatable/view-datatable.component';
import { IconsModule } from '../../../shared/icons.module';
import { AuthService } from '../../../authentication/auth-service.service';

import { ProfitReport } from '../models/terminal-report';
@Component({
  selector: 'app-profit-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ViewDatatableComponent,
    IconsModule
  ],
  templateUrl: './profit-reports.component.html',
  styleUrl: './profit-reports.component.css'
})
export class ProfitReportsComponent implements OnInit {

  loading = false;

  /* ================= FILTERS ================= */
  filters = {
    fromDate: '',
    toDate: '',
    companyId: null as number | null,
    branchId: null as number | null,
    reportType: 'ITEM' as 'ITEM' | 'INVOICE' | 'DAY'
  };

  /* ================= DROPDOWNS ================= */
  companies: any[] = [];
  branches: any[] = [];

  /* ================= DATA ================= */
  profitData: ProfitReport[] = [];

  /* ================= KPI ================= */
  totalSales = 0;
  totalCost = 0;
  totalProfit = 0;

  /* ================= TABLE ================= */
  columns: any[] = [];

  constructor(
    private reportService: ReportService,
    private commonService: CommonserviceService,
    private authService: AuthService
  ) {}

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

  /* ================= LOAD REPORT ================= */
  loadReport(): void {
    if (!this.filters.companyId) return;

    this.loading = true;

    this.reportService
      .getProfitReport(
        this.filters.companyId,
        this.filters.reportType,
        this.filters.fromDate,
        this.filters.toDate,
        this.filters.branchId ?? undefined
      )
      .subscribe({
        next: res => {
          this.profitData = res ?? [];
          this.updateColumns();
          this.calculateTotals();
          this.loading = false;
        },
        error: err => {
          console.error('Profit Report Error', err);
          this.profitData = [];
          this.resetTotals();
          this.loading = false;
        }
      });
  }

  /* ================= COLUMNS ================= */
  private updateColumns(): void {
    switch (this.filters.reportType) {

      case 'ITEM':
        this.columns = [
          { header: 'Product Code', field: 'productCode' },
          { header: 'Product Name', field: 'productName' },
          { header: 'Sold Qty', field: 'soldQty' },
          { header: 'Avg Cost', field: 'avgPurchaseRate' },
          { header: 'Cost Amount', field: 'costAmount' },
          { header: 'Sales Amount', field: 'salesAmount' },
          { header: 'Profit', field: 'profitAmount' }
        ];
        break;

      case 'INVOICE':
        this.columns = [
          { header: 'Invoice No', field: 'invoiceNumber' },
          { header: 'Invoice Date', field: 'invoiceDate' },
          { header: 'Customer', field: 'customerName' },
          { header: 'Sold Qty', field: 'soldQty' },
          { header: 'Cost', field: 'costAmount' },
          { header: 'Sales', field: 'salesAmount' },
          { header: 'Profit', field: 'profitAmount' }
        ];
        break;

      case 'DAY':
        this.columns = [
          { header: 'Date', field: 'saleDate' },
          { header: 'Sold Qty', field: 'soldQty' },
          { header: 'Cost', field: 'costAmount' },
          { header: 'Sales', field: 'salesAmount' },
          { header: 'Profit', field: 'profitAmount' }
        ];
        break;
    }
  }

  /* ================= KPI ================= */
  private calculateTotals(): void {
    this.resetTotals();

    for (const r of this.profitData) {
      this.totalSales += r.salesAmount || 0;
      this.totalCost += r.costAmount || 0;
      this.totalProfit += r.profitAmount || 0;
    }
  }

  private resetTotals(): void {
    this.totalSales = 0;
    this.totalCost = 0;
    this.totalProfit = 0;
  }

  /* ================= UI ================= */
  onRefresh(): void {
    this.loadReport();
  }

  onClearFilters(): void {
    const today = new Date().toISOString().split('T')[0];

    this.filters.fromDate = today;
    this.filters.toDate = today;
    this.filters.branchId = null;
    this.filters.reportType = 'ITEM';

    this.loadReport();
  }
}
