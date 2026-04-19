import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ExpenseService } from '../../../services/expense.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-expense-view',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './expense-view.component.html',
  styleUrl: './expense-view.component.css'
})
export class ExpenseViewComponent implements OnInit {

  companies:     any[] = [];
  categories:    any[] = [];
  subCategories: any[] = [];
  entries:       any[] = [];
  filtered:      any[] = [];

  selectedCompanyID: any = null;
  searchText        = '';
  filterStatus      = '';
  filterPayment     = '';
  filterDateFrom    = '';
  filterDateTo      = '';

  isLoading = false;
  pageSize    = 10;
  currentPage = 1;

  private destroyRef = inject(DestroyRef);

  constructor(
    private expenseService: ExpenseService,
    private commonService:  CommonserviceService,
    private swal:           SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  private parseRes<T>(res: any): T[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  }

  private getStoredCompanyId(): number {
    const raw =
      localStorage.getItem('companyId')  ||
      localStorage.getItem('companyID')  ||
      localStorage.getItem('CompanyId')  ||
      localStorage.getItem('CompanyID')  ||
      localStorage.getItem('company_id') ||
      localStorage.getItem('COMPANYID');

    const n = Number(raw);
    console.log(' localStorage raw:', raw, '→ number:', n);
    return isNaN(n) || n === 0 ? 0 : n;
  }

  // ================= STEP 1: LOAD COMPANIES =================
  loadCompanies(): void {
    this.commonService.getCompanies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.companies = this.parseRes(res);
          console.log(' Companies loaded:', this.companies.length,
            this.companies.map(c => `${c.companyID}:${c.companyName}`));

          this.autoSelectCompany();
        },
        error: err => console.error('Companies error:', err)
      });
  }

  // ================= AUTO SELECT =================
  private autoSelectCompany(): void {
    const storedId = this.getStoredCompanyId();
    console.log('🔍 Trying to match companyId:', storedId);

    if (storedId > 0) {
      const match = this.companies.find(c =>
        Number(c.companyID) === storedId
      );

      if (match) {
        console.log(' Matched company:', match.companyName);
        this.selectedCompanyID = match.companyID;
        this.loadAll(match.companyID);
        return;
      } else {
        console.warn(' No company matched for ID:', storedId,
          '| Available IDs:', this.companies.map(c => Number(c.companyID)));
      }
    }

    // Fallback: single company
    if (this.companies.length === 1) {
      console.log('ℹ Auto-selecting only company:', this.companies[0].companyName);
      this.selectedCompanyID = this.companies[0].companyID;
      this.loadAll(this.selectedCompanyID);
    }
  }

  // ================= ON DROPDOWN CHANGE =================
  onCompanyChange(): void {
    if (!this.selectedCompanyID) return;
    this.categories    = [];
    this.subCategories = [];
    this.entries       = [];
    this.filtered      = [];
    this.loadAll(Number(this.selectedCompanyID));
  }

  // ================= LOAD ALL =================
  loadAll(companyId: number): void {
    console.log(' loadAll for companyId:', companyId);

    // Load categories
    this.expenseService.getCategories(companyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.categories = this.parseRes(res);
          console.log('Categories:', this.categories.length, this.categories);
        },
        error: err => console.error(' Categories error:', err)
      });

    // Load entries
    this.loadEntries(companyId);
  }

  // ================= LOAD ENTRIES =================
  loadEntries(companyId?: number): void {
    const id = companyId ?? Number(this.selectedCompanyID);
    if (!id) return;

    this.isLoading = true;
    this.entries   = [];
    this.filtered  = [];

    this.expenseService.getExpenseEntries(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.isLoading = false;
          this.entries   = this.parseRes(res);
          console.log('Entries:', this.entries.length);
          if (this.entries[0]) {
            console.log(' Entry sample keys:', Object.keys(this.entries[0]));
            console.log(' Entry sample:', this.entries[0]);
          }

          this.loadSubCategoriesForEntries(id);
          this.applyFilters();
        },
        error: err => {
          this.isLoading = false;
          console.error(' Entries error:', err);
          this.swal.error('Error', 'Failed to load expense entries');
        }
      });
  }

  // ================= LOAD SUBCATEGORIES PER ENTRY =================
  private loadSubCategoriesForEntries(companyId: number): void {
    // Get all unique non-zero categoryIDs from entries
    const uniqueCatIds = [
      ...new Set(
        this.entries
          .map(e => Number(e.expenseCategoryID))
          .filter(id => id > 0)
      )
    ];

    console.log(' Loading subcategories for categoryIDs:', uniqueCatIds);

    if (uniqueCatIds.length === 0) {
      console.warn(' No categoryIDs found in entries');
      return;
    }

    uniqueCatIds.forEach(catId => {
      this.expenseService.getSubCategories(companyId, catId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res: any) => {
            const list = this.parseRes<any>(res);
            // Merge — avoid duplicates
            list.forEach((sub: any) => {
              const exists = this.subCategories.some(
                s => Number(s.expenseSubCategoryID) === Number(sub.expenseSubCategoryID)
              );
              if (!exists) this.subCategories.push(sub);
            });
            console.log(` SubCats for catID ${catId}:`, list.length,
              '| Total subCats:', this.subCategories.length);
          },
          error: err => console.error(` SubCat error catID ${catId}:`, err)
        });
    });
  }

  // ================= NAME RESOLVERS =================
  resolveCategoryName(row: any): string {
    // First check if API already returns the name
    if (row.categoryName?.trim()) return row.categoryName;

    const id = Number(row.expenseCategoryID);
    if (!id) return '—';

    const found = this.categories.find(c =>
      Number(c.expenseCategoryID) === id ||
      Number(c.categoryID)        === id
    );

    return found?.categoryName ?? '—';
  }

  resolveSubCategoryName(row: any): string {
    if (row.subCategoryName?.trim()) return row.subCategoryName;

    const id = Number(row.expenseSubCategoryID);
    if (!id) return '—';

    const found = this.subCategories.find(s =>
      Number(s.expenseSubCategoryID) === id ||
      Number(s.subCategoryID)        === id
    );

    return found?.subCategoryName ?? '—';
  }

  // ================= FILTERS =================
  applyFilters(): void {
    let data = [...this.entries];

    if (this.searchText.trim()) {
      const s = this.searchText.toLowerCase();
      data = data.filter(e =>
        (e.description  || '').toLowerCase().includes(s) ||
        (e.paidTo       || '').toLowerCase().includes(s) ||
        (e.paymentMode  || '').toLowerCase().includes(s) ||
        this.resolveCategoryName(e).toLowerCase().includes(s) ||
        this.resolveSubCategoryName(e).toLowerCase().includes(s)
      );
    }

    if (this.filterStatus)  data = data.filter(e => e.expenseStatus === this.filterStatus);
    if (this.filterPayment) data = data.filter(e => e.paymentMode   === this.filterPayment);

    if (this.filterDateFrom) {
      const from = new Date(this.filterDateFrom);
      data = data.filter(e => new Date(e.expenseDate) >= from);
    }

    if (this.filterDateTo) {
      const to = new Date(this.filterDateTo);
      data = data.filter(e => new Date(e.expenseDate) <= to);
    }

    this.filtered    = data;
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchText     = '';
    this.filterStatus   = '';
    this.filterPayment  = '';
    this.filterDateFrom = '';
    this.filterDateTo   = '';
    this.applyFilters();
  }

  // ================= PAGINATION =================
  get totalPages(): number {
    return Math.ceil(this.filtered.length / this.pageSize) || 1;
  }

  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (
      let i = Math.max(1, this.currentPage - 2);
      i <= Math.min(this.totalPages, this.currentPage + 2);
      i++
    ) pages.push(i);
    return pages;
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  // ================= COMPUTED =================
  get pageTotal(): number {
    return this.paginatedData.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  }

  get showingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.filtered.length);
  }

  get showingFrom(): number {
    return this.filtered.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get totalAmount(): number {
    return this.filtered.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  }

  get completedCount(): number {
    return this.filtered.filter(e => e.expenseStatus === 'Completed').length;
  }

  get pendingCount(): number {
    return this.filtered.filter(e => e.expenseStatus === 'Pending').length;
  }

  // ================= HELPERS =================
  getStatusClass(s: string): string {
    return s === 'Completed' ? 'badge-success' : 'badge-warning';
  }

  getPaymentMode(mode: string): string {
    return mode || '—';
  }
}
