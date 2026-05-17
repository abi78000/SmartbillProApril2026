import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';

import { ReportService } from '../report.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { AuthService } from '../../../authentication/auth-service.service';
import { ViewDatatableComponent } from '../../components/view-datatable/view-datatable.component';
import { IconsModule } from '../../../shared/icons.module';

@Component({
  selector: 'app-reportdashboard',
  standalone: true,

  imports: [CommonModule, FormsModule, ViewDatatableComponent, IconsModule],

  templateUrl: './reportdashboard.component.html',
  styleUrl: './reportdashboard.component.css',
})
export class ReportdashboardComponent implements OnInit {
  loading = false;

  /* ================= FILTERS ================= */

  filters = {
    fromDate: '',
    toDate: '',
    companyId: null as number | null,
    branchId: null as number | null,
  };

  /* ================= DROPDOWNS ================= */

  companies: any[] = [];
  branches: any[] = [];

  /* ================= DASHBOARD ================= */

  dashboard = {
    totalSales: 0,
    totalProfit: 0,
    totalGST: 0,
    totalStock: 0,
    totalOutstanding: 0,

    totalBills: 0,

    cashTotal: 0,
    cardTotal: 0,
    upiTotal: 0,

    transactions: [] as any[],
  };

  /* ================= TABLE ================= */

  columns = [
    {
      header: 'Invoice No',
      field: 'invoiceNumber',
      visible: true,
    },

    {
      header: 'Customer',
      field: 'customerName',
      visible: true,
    },

    {
      header: 'Amount',
      field: 'grandTotal',
      visible: true,
    },

    {
      header: 'Date',
      field: 'invoiceDate',
      visible: true,
    },
  ];

  constructor(
    private reportService: ReportService,
    private commonService: CommonserviceService,
    private authService: AuthService,
  ) {}

  /* ================= INIT ================= */

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];

    this.filters.fromDate = today;
    this.filters.toDate = today;

    this.filters.companyId = this.authService.companyId;

    this.loadDropdowns();

    this.loadDashboard();
  }

  /* ================= DROPDOWNS ================= */

  loadDropdowns(): void {
    forkJoin({
      companies: this.commonService.getCompanies(),

      branches: this.filters.companyId
        ? this.commonService.getBranchesByCompany(this.filters.companyId)
        : of([]),
    }).subscribe({
      next: (res: any) => {
        this.companies = res.companies ?? [];

        this.branches = res.branches ?? [];
      },
    });
  }

  /* ================= FILTER ================= */

  onFilterChange(): void {
    this.loadDashboard();
  }

  onCompanyChange(): void {
    this.filters.branchId = null;

    if (this.filters.companyId) {
      this.commonService
        .getBranchesByCompany(this.filters.companyId)

        .subscribe((res) => {
          this.branches = res ?? [];
        });
    }

    this.loadDashboard();
  }

  /* ================= DASHBOARD LOAD ================= */

  loadDashboard(): void {
    if (!this.filters.companyId) return;

    this.loading = true;

    forkJoin({
      sales: this.reportService.getSalesReport(
        this.filters.companyId,
        'SUMMARY',
        this.filters.fromDate,
        this.filters.toDate,
        this.filters.branchId ?? undefined,
      ),

      profit: this.reportService.getProfitReport(
        this.filters.companyId,
        'ITEM',
        this.filters.fromDate,
        this.filters.toDate,
        this.filters.branchId ?? undefined,
      ),

      gst: this.reportService.getGSTFiling(
        this.filters.companyId,
        'B2B',
        this.filters.branchId ?? undefined,
        this.filters.fromDate,
        this.filters.toDate,
      ),

      stock: this.reportService.getStockReport(this.filters.companyId, 'TOTAL'),

      outstanding: this.reportService.getCustomerOutstanding(
        this.filters.companyId,
        'CUSTOMER',
        this.filters.fromDate,
        this.filters.toDate,
      ),

      terminal: this.reportService.getTerminalReport(
        this.filters.fromDate,
        this.filters.toDate,
        this.filters.companyId,
        this.filters.branchId ?? undefined,
      ),
    }).subscribe({
      next: (res: any) => {
        /* SALES */

        this.dashboard.totalSales = Number(res.terminal?.netSales ?? 0);

        this.dashboard.totalBills = Number(res.terminal?.totalBills ?? 0);

        this.dashboard.cashTotal = Number(res.terminal?.cashTotal ?? 0);

        this.dashboard.cardTotal = Number(res.terminal?.cardTotal ?? 0);

        this.dashboard.upiTotal = Number(res.terminal?.upiTotal ?? 0);

        /* GST */

        this.dashboard.totalGST = Number(res.terminal?.totalGST ?? 0);

        /* PROFIT */

        this.dashboard.totalProfit = (res.profit ?? []).reduce(
          (sum: number, item: any) => sum + Number(item.profitAmount ?? 0),

          0,
        );

        /* STOCK */

        this.dashboard.totalStock = (res.stock ?? []).reduce(
          (sum: number, item: any) => sum + Number(item.stockValue ?? 0),

          0,
        );

        /* OUTSTANDING */

        this.dashboard.totalOutstanding = (res.outstanding ?? []).reduce(
          (sum: number, item: any) => sum + Number(item.outstandingAmount ?? 0),

          0,
        );

        /* TABLE */

        this.dashboard.transactions = (res.sales ?? []).slice(0, 10);

        this.loading = false;
      },

      error: (err) => {
        console.error('Dashboard Error', err);

        this.loading = false;
      },
    });
  }

  get visibleColumns() {
    return this.columns.filter((x) => x.visible !== false);
  }
}
