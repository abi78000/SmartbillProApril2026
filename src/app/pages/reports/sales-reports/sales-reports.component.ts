import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';

import { ReportService } from '../report.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { ViewDatatableComponent } from '../../components/view-datatable/view-datatable.component';
import { IconsModule } from '../../../shared/icons.module';
import { AuthService } from '../../../authentication/auth-service.service';
import { SalesReportCommon } from '../models/terminal-report';
@Component({
  selector: 'app-sales-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ViewDatatableComponent,
    IconsModule
  ],
  templateUrl: './sales-reports.component.html',
  styleUrl: './sales-reports.component.css'
})
export class SalesReportsComponent implements OnInit {

  loading = false;

  /* ================= FILTERS ================= */
  filters = {
    fromDate: '',
    toDate: '',
    companyId: null as number | null,
    branchId: null as number | null,
    reportType: 'SUMMARY' as
      | 'SUMMARY'
      | 'DETAILED'
      | 'PAYMODE'
      | 'CUSTOMER'
      | 'AREA'
  };

  /* ================= DROPDOWNS ================= */
  companies: any[] = [];
  branches: any[] = [];

  /* ================= DATA ================= */
  salesData: SalesReportCommon[] = [];

  /* ================= KPI TOTALS ================= */
  totalSales = 0;
  totalTaxable = 0;
  totalGST = 0;
  totalPaid = 0;
  totalBalance = 0;

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

    this.reportService
      .getSalesReport(
        this.filters.companyId,
        this.filters.reportType,
        this.filters.fromDate || undefined,
        this.filters.toDate || undefined,
        this.filters.branchId ?? undefined
      )
      .subscribe({
        next: res => {
          this.salesData = res ?? [];
          this.updateColumnsByType();
          this.calculateTotals();
          this.loading = false;
        },
        error: err => {
          console.error('Sales Report Error', err);
          this.salesData = [];
          this.resetTotals();
          this.loading = false;
        }
      });
  }

  /* ================= COLUMN SWITCH ================= */
  private updateColumnsByType(): void {

    switch (this.filters.reportType) {

      case 'SUMMARY':
        this.columns = [
          { header: 'Invoice No', field: 'invoiceNumber' },
          { header: 'Invoice Date', field: 'invoiceDate' },
          { header: 'Customer', field: 'customerName' },
          { header: 'Billing Mode', field: 'billingMode' },
          { header: 'Total Qty', field: 'totalQuantity' },
          { header: 'Taxable', field: 'taxableAmount' },
          { header: 'GST', field: 'gstAmount' },
          { header: 'Grand Total', field: 'grandTotal' },
          { header: 'Paid', field: 'paidAmount' },
          { header: 'Balance', field: 'balanceAmount' }
        ];
        break;

      case 'DETAILED':
        this.columns = [
          { header: 'Invoice No', field: 'invoiceNumber' },
          { header: 'Product Code', field: 'productCode' },
          { header: 'Product Name', field: 'productName' },
          { header: 'Qty', field: 'quantity' },
          { header: 'Rate', field: 'saleRate' },
          { header: 'Taxable', field: 'taxableAmount' },
          { header: 'GST', field: 'gstAmount' },
          { header: 'Net Amount', field: 'grandTotal' }
        ];
        break;

      case 'PAYMODE':
        this.columns = [
          { header: 'Payment Mode', field: 'billingMode' },
          { header: 'Invoice Count', field: 'invoiceCount' },
          { header: 'Cash', field: 'cashAmount' },
          { header: 'Card', field: 'cardAmount' },
          { header: 'UPI', field: 'upiAmount' },
          { header: 'Total Paid', field: 'totalSalesAmount' }
        ];
        break;

      case 'CUSTOMER':
        this.columns = [
          { header: 'Customer Name', field: 'customerName' },
          { header: 'GSTIN', field: 'customerGSTIN' },
          { header: 'Invoice Count', field: 'invoiceCount' },
          { header: 'Total Sales', field: 'totalSalesAmount' }
        ];
        break;

      case 'AREA':
        this.columns = [
          { header: 'Area', field: 'area' },
          { header: 'Invoice Count', field: 'invoiceCount' },
          { header: 'Total Sales', field: 'totalSalesAmount' }
        ];
        break;
    }
  }

  /* ================= KPI CALCULATION ================= */
  private calculateTotals(): void {
    this.resetTotals();

    for (const r of this.salesData) {
      this.totalSales += r.totalSalesAmount || r.grandTotal || 0;
      this.totalTaxable += r.taxableAmount || 0;
      this.totalGST += r.gstAmount || 0;
      this.totalPaid += r.paidAmount || 0;
      this.totalBalance += r.balanceAmount || 0;
    }
  }

  private resetTotals(): void {
    this.totalSales = 0;
    this.totalTaxable = 0;
    this.totalGST = 0;
    this.totalPaid = 0;
    this.totalBalance = 0;
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
    this.filters.reportType = 'SUMMARY';

    this.loadReport();
  }
}
