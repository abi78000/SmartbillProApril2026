import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReportService } from '../report.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { ViewDatatableComponent } from '../../components/view-datatable/view-datatable.component';
import { IconsModule } from '../../../shared/icons.module';
import { AuthService } from '../../../authentication/auth-service.service';

import { StockReport } from '../models/terminal-report';
@Component({
  selector: 'app-stock-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ViewDatatableComponent,
    IconsModule
  ],
  templateUrl: './stock-reports.component.html',
  styleUrl: './stock-reports.component.css'
})
export class StockReportsComponent implements OnInit {

  loading = false;

  /* ================= FILTERS ================= */
  filters = {
    fromDate: '',
    toDate: '',
    companyId: null as number | null,
    branchId: null as number | null,
    reportType: 'TOTAL' as
      'TOTAL' | 'LOW' | 'FAST' | 'SLOW' | 'LEDGER' | 'VALUATION',
    days: 30
  };

  /* ================= DROPDOWNS ================= */
  companies: any[] = [];
  branches: any[] = [];

  /* ================= DATA ================= */
  stockData: StockReport[] = [];

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
    if (!this.filters.companyId) return;

    this.commonService.getCompanies().subscribe(c => this.companies = c ?? []);
    this.commonService
      .getBranchesByCompany(this.filters.companyId)
      .subscribe(b => this.branches = b ?? []);
  }

  onCompanyChange(): void {
    this.filters.branchId = null;
    this.loadDropdowns();
    this.loadReport();
  }

  onFilterChange(): void {
    this.loadReport();
  }

  /* ================= LOAD REPORT ================= */
  loadReport(): void {
    if (!this.filters.companyId) return;

    this.loading = true;
    this.stockData = [];

    this.reportService
      .getStockReport(
        this.filters.companyId,
        this.filters.reportType,
        this.filters.reportType === 'LEDGER' ? this.filters.fromDate : undefined,
        this.filters.reportType === 'LEDGER' ? this.filters.toDate : undefined,
        this.filters.branchId ?? undefined,
        this.filters.days
      )
      .subscribe({
        next: res => {
          this.stockData = res ?? [];
          this.updateColumns();
          this.loading = false;
        },
        error: err => {
          console.error('Stock Report Error', err);
          this.loading = false;
        }
      });
  }

  /* ================= TABLE COLUMNS ================= */
  private updateColumns(): void {
    const map: any = {
      TOTAL: [
        { header: 'Code', field: 'productCode' },
        { header: 'Product', field: 'productName' },
        { header: 'Stock', field: 'currentStock' },
        { header: 'Purchase Rate', field: 'purchaseRate' },
        { header: 'Sale Rate', field: 'saleRate' },
        { header: 'Value', field: 'stockValue' }
      ],
      LOW: [
        { header: 'Code', field: 'productCode' },
        { header: 'Product', field: 'productName' },
        { header: 'Stock', field: 'currentStock' },
        { header: 'Reorder Level', field: 'reorderLevel' }
      ],
      FAST: [
        { header: 'Code', field: 'productCode' },
        { header: 'Product', field: 'productName' },
        { header: 'Sold Qty', field: 'soldQty' }
      ],
      SLOW: [
        { header: 'Code', field: 'productCode' },
        { header: 'Product', field: 'productName' },
        { header: 'Sold Qty', field: 'soldQty' }
      ],
      LEDGER: [
        { header: 'Code', field: 'productCode' },
        { header: 'Product', field: 'productName' },
        { header: 'Type', field: 'txnType' },
        { header: 'Qty', field: 'quantity' },
        { header: 'Date', field: 'txnDate' }
      ],
      VALUATION: [
        { header: 'Code', field: 'productCode' },
        { header: 'Product', field: 'productName' },
        { header: 'Stock', field: 'currentStock' },
        { header: 'Purchase Rate', field: 'purchaseRate' },
        { header: 'Value', field: 'stockValue' }
      ]
    };

    this.columns = map[this.filters.reportType];
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
    this.filters.reportType = 'TOTAL';
    this.filters.days = 30;
    this.loadReport();
  }
}
