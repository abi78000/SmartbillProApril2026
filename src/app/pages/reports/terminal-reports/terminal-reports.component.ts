import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';

import { ReportService } from '../report.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { ViewDatatableComponent } from '../../components/view-datatable/view-datatable.component';
import { IconsModule } from '../../../shared/icons.module';
import { AuthService } from '../../../authentication/auth-service.service';

@Component({
  selector: 'app-terminal-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ViewDatatableComponent,
    IconsModule
  ],
  templateUrl: './terminal-reports.component.html',
  styleUrl: './terminal-reports.component.css'
})
export class TerminalReportsComponent implements OnInit {

  loading = false;

  /* ================= FILTERS ================= */
  filters = {
    fromDate: '',
    toDate: '',
    companyId: null as number | null,
    branchId: null as number | null,
    createdBy: null as string | null
  };

  /* ================= DROPDOWNS ================= */
  companies: any[] = [];
  branches: any[] = [];
  users: any[] = [];

  /* ================= DATA ================= */
  summary: any = this.getEmptySummary();
  bills: any[] = [];

  /* ================= TABLE COLUMNS ================= */
  columns = [
    { header: 'Terminal User', field: 'terminalUser', visible: true },

    { header: 'Total Bills', field: 'totalBills', visible: true },
    { header: 'Total Qty', field: 'totalQuantity', visible: false },

    { header: 'Gross Sales', field: 'grossSales', visible: true },
    { header: 'Discount', field: 'discountAmount', visible: false },
    { header: 'Taxable Amount', field: 'taxableAmount', visible: false },

    { header: 'CGST', field: 'cgst', visible: false },
    { header: 'SGST', field: 'sgst', visible: false },
    { header: 'IGST', field: 'igst', visible: false },
    { header: 'CESS', field: 'cess', visible: false },
    { header: 'Total GST', field: 'totalGST', visible: true },

    { header: 'Net Sales', field: 'netSales', visible: true },

    { header: 'Cash', field: 'cashTotal', visible: true },
    { header: 'Card', field: 'cardTotal', visible: true },
    { header: 'UPI', field: 'upiTotal', visible: true },
    { header: 'Advance', field: 'advanceTotal', visible: false },

    { header: 'Paid', field: 'totalPaid', visible: false },
    { header: 'Balance', field: 'balanceAmount', visible: true },

    { header: 'Cancelled Bills', field: 'cancelledBills', visible: false },
    { header: 'Cancelled Amount', field: 'cancelledAmount', visible: false }
  ];

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
        : of([]),
      users: this.commonService.getUsers()
    }).subscribe(res => {
      this.companies = res.companies ?? [];
      this.branches = res.branches ?? [];
      this.users = res.users ?? [];
    });
  }

  onCompanyChange(): void {
    this.filters.branchId = null;
    this.filters.createdBy = null;

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

  /* ================= REPORT ================= */
  loadReport(): void {
    if (!this.filters.companyId) return;

    this.loading = true;

    this.reportService.getTerminalReport(
      this.filters.fromDate,
      this.filters.toDate,
      this.filters.companyId,
      this.filters.branchId ?? undefined,
      this.filters.createdBy ?? undefined
    ).subscribe({
      next: (res: any) => {

        if (!res) {
          this.resetData();
          this.loading = false;
          return;
        }

        // ✅ SAFE NUMBER MAPPING
        this.summary = {
          terminalUser: res.terminalUser ?? '',
          totalBills: Number(res.totalBills ?? 0),
          totalQuantity: Number(res.totalQuantity ?? 0),
          grossSales: Number(res.grossSales ?? 0),
          discountAmount: Number(res.discountAmount ?? 0),
          taxableAmount: Number(res.taxableAmount ?? 0),
          cgst: Number(res.cgst ?? 0),
          sgst: Number(res.sgst ?? 0),
          igst: Number(res.igst ?? 0),
          cess: Number(res.cess ?? 0),
          totalGST: Number(res.totalGST ?? 0),
          netSales: Number(res.netSales ?? 0),
          cashTotal: Number(res.cashTotal ?? 0),
          cardTotal: Number(res.cardTotal ?? 0),
          upiTotal: Number(res.upiTotal ?? 0),
          advanceTotal: Number(res.advanceTotal ?? 0),
          totalPaid: Number(res.totalPaid ?? 0),
          balanceAmount: Number(res.balanceAmount ?? 0),
          cancelledBills: Number(res.cancelledBills ?? 0),
          cancelledAmount: Number(res.cancelledAmount ?? 0)
        };

        // TABLE NEEDS ARRAY
        this.bills = [this.summary];

        this.loading = false;
      },
      error: (err) => {
        console.error('Terminal Report Error', err);
        this.resetData();
        this.loading = false;
      }
    });
  }

  /* ================= KPI ================= */
  avgBill(): number {
    if (!this.summary.totalBills) return 0;
    return this.summary.netSales / this.summary.totalBills;
  }

  /* ================= HELPERS ================= */
  get visibleColumns() {
    return this.columns.filter(c => c.visible !== false);
  }

  private resetData(): void {
    this.summary = this.getEmptySummary();
    this.bills = [];
  }

  private getEmptySummary() {
    return {
      terminalUser: '',
      totalBills: 0,
      totalQuantity: 0,
      grossSales: 0,
      discountAmount: 0,
      taxableAmount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      cess: 0,
      totalGST: 0,
      netSales: 0,
      cashTotal: 0,
      cardTotal: 0,
      upiTotal: 0,
      advanceTotal: 0,
      totalPaid: 0,
      balanceAmount: 0,
      cancelledBills: 0,
      cancelledAmount: 0
    };
  }

}
