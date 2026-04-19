import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';

import { ReportService } from '../report.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { ViewDatatableComponent } from '../../components/view-datatable/view-datatable.component';
import { IconsModule } from '../../../shared/icons.module';
import { AuthService } from '../../../authentication/auth-service.service';

import {
  CustomerOutstandingReport,
  SupplierOutstandingReport
} from '../models/terminal-report';

@Component({
  selector: 'app-outstanding-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ViewDatatableComponent,
    IconsModule
  ],
  templateUrl: './outstanding-reports.component.html',
  styleUrl: './outstanding-reports.component.css'
})
export class OutstandingReportsComponent implements OnInit {

  loading = false;

  /* ================= FILTERS ================= */
  filters = {
    fromDate: '',
    toDate: '',
    companyId: null as number | null,
    branchId: null as number | null,

    // IMPORTANT: this is what SP expects
    outstandingType: 'SUPPLIER' as 'CUSTOMER' | 'SUPPLIER',

    // UI grouping only (not sent to SP now)
    groupBy: 'AREA' as 'AREA' | 'DATE'
  };

  /* ================= DROPDOWNS ================= */
  companies: any[] = [];
  branches: any[] = [];

  /* ================= DATA ================= */
  customerData: CustomerOutstandingReport[] = [];
  supplierData: SupplierOutstandingReport[] = [];

  /* ================= KPI ================= */
  totalBill = 0;
  totalPaid = 0;
  totalOutstanding = 0;

  /* ================= TABLE ================= */
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

  /* ================= LOAD REPORT ================= */
  loadReport(): void {
    if (!this.filters.companyId) return;

    this.loading = true;
    this.resetTotals();

    // ================= CUSTOMER =================
    if (this.filters.outstandingType === 'CUSTOMER') {
      this.reportService
        .getCustomerOutstanding(
          this.filters.companyId,
          'CUSTOMER', // ✅ EXACT VALUE SP EXPECTS
          this.filters.fromDate || undefined,
          this.filters.toDate || undefined,
          this.filters.branchId ?? undefined
        )
        .subscribe({
          next: res => {
            this.customerData = res ?? [];
            this.updateColumns();
            this.calculateCustomerTotals();
            this.loading = false;
          },
          error: err => {
            console.error('Customer Outstanding Error', err);
            this.customerData = [];
            this.loading = false;
          }
        });

    // ================= SUPPLIER =================
    } else {
      this.reportService
        .getSupplierOutstanding(
          this.filters.companyId,
          'SUPPLIER', // ✅ EXACT VALUE SP EXPECTS
          this.filters.fromDate || undefined,
          this.filters.toDate || undefined,
          this.filters.branchId ?? undefined
        )
        .subscribe({
          next: res => {
            this.supplierData = res ?? [];
            this.updateColumns();
            this.calculateSupplierTotals();
            this.loading = false;
          },
          error: err => {
            console.error('Supplier Outstanding Error', err);
            this.supplierData = [];
            this.loading = false;
          }
        });
    }
  }

  /* ================= TABLE COLUMNS ================= */
  private updateColumns(): void {
    if (this.filters.outstandingType === 'CUSTOMER') {
      this.columns = [
        { header: '#', field: 'customerId' },
        { header: 'Customer', field: 'customerName' },
        { header: 'Area', field: 'area' },
        { header: 'Invoices', field: 'invoiceCount' },
        { header: 'Invoice Amount', field: 'invoiceAmount' },
        { header: 'Paid', field: 'paidAmount' },
        { header: 'Outstanding', field: 'outstandingAmount' }
      ];
    } else {
      this.columns = [
        { header: '#', field: 'supplierId' },
        { header: 'Supplier', field: 'supplierName' },
        { header: 'Purchases', field: 'purchaseCount' },
        { header: 'Bill Amount', field: 'billAmount' },
        { header: 'Paid', field: 'paidAmount' },
        { header: 'Outstanding', field: 'outstandingAmount' }
      ];
    }
  }

  /* ================= KPI CALCULATION ================= */
  private calculateCustomerTotals(): void {
    for (const r of this.customerData) {
      this.totalBill += r.invoiceAmount || 0;
      this.totalPaid += r.paidAmount || 0;
      this.totalOutstanding += r.outstandingAmount || 0;
    }
  }

  private calculateSupplierTotals(): void {
    for (const r of this.supplierData) {
      this.totalBill += r.billAmount || 0;
      this.totalPaid += r.paidAmount || 0;
      this.totalOutstanding += r.outstandingAmount || 0;
    }
  }

  private resetTotals(): void {
    this.totalBill = 0;
    this.totalPaid = 0;
    this.totalOutstanding = 0;
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
    this.filters.groupBy = 'AREA';

    this.loadReport();
  }
}
