import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { CommonserviceService } from '../../../services/commonservice.service';
import { ExpenseService } from '../../../services/expense.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-expense-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './expense-entry.component.html',
  styleUrls: ['./expense-entry.component.css']
})
export class ExpenseEntryComponent implements OnInit {

  companies:  any[] = [];
  branches:   any[] = [];
  categories: any[] = [];

  // per-row subcategory map
  subCategoriesMap: { [rowIndex: number]: any[] } = {};

  expenseHeader: any = {};
  gridData:      any[] = [];
  isSaving             = false;

  private destroyRef = inject(DestroyRef);

  constructor(
    private commonService: CommonserviceService,
    private expenseService: ExpenseService,
    private swal: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCompanies();
  }

  // ================= INIT =================
  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  initForm(): void {
    this.expenseHeader = {
      expenseID:         0,
      companyID:         null,
      branchID:          null,
      expenseDate:       this.getToday(),
      paymentMode:       'Cash',
      paidTo:            '',
      paymentReference:  '',
      paymentDate:       this.getToday(),
      bankName:          '',
      bankAccountNumber: '',
      ifscCode:          '',
      expenseStatus:     'Completed'
    };

    this.branches         = [];
    this.categories       = [];
    this.subCategoriesMap = {};
    this.gridData         = [this.getEmptyRow()];
  }

  getEmptyRow(): any {
    return {
      expenseCategoryID:    null,
      expenseSubCategoryID: null,
      subCategories:        [],
      description:          '',
      quantity:             1,
      rate:                 0,
      amount:               0
    };
  }

  private parseRes<T>(res: any): T[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  }

  private toNum(val: any): number | null {
    if (val === null || val === undefined || val === '' || val == 0) return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  }

  // ================= LOAD COMPANIES =================
  loadCompanies(): void {
    this.commonService.getCompanies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.companies = this.parseRes(res);
          console.log('✅ Companies loaded:', this.companies.length);
        },
        error: err => console.error('❌ Companies error:', err)
      });
  }

  // ================= COMPANY CHANGE → BRANCH + CATEGORY =================
  onCompanyChange(companyId: any): void {
    const id = this.toNum(companyId);

    this.branches         = [];
    this.categories       = [];
    this.subCategoriesMap = {};
    this.expenseHeader.branchID = null;
    this.gridData = [this.getEmptyRow()];

    if (!id) return;

    console.log('🏢 Company changed:', id);

    this.commonService.getBranchesByCompany(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.branches = this.parseRes(res);
          console.log('✅ Branches loaded:', this.branches.length);
        },
        error: err => console.error('❌ Branches error:', err)
      });

    this.expenseService.getCategories(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.categories = this.parseRes(res);
          console.log('✅ Categories loaded:', this.categories.length);
        },
        error: err => console.error('❌ Categories error:', err)
      });
  }

  // ================= CATEGORY CHANGE → SUBCATEGORY =================
  onCategoryChange(rowIndex: number): void {
    const row        = this.gridData[rowIndex];
    const categoryId = this.toNum(row?.expenseCategoryID);
    const companyId  = this.toNum(this.expenseHeader.companyID);

    console.log('📂 Category changed — row:', rowIndex,
      'categoryId:', categoryId, 'companyId:', companyId);

    // reset subcategory on this row
    row.expenseSubCategoryID = null;
    row.subCategories        = [];

    if (!categoryId || !companyId) return;

    console.log(`🔄 Loading subcategories — company:${companyId}, category:${categoryId}`);

    this.expenseService
      .getSubCategories(companyId, categoryId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const list       = this.parseRes<any>(res);
          row.subCategories = list; // ✅ stored directly on the row
          console.log(`✅ SubCategories loaded for row ${rowIndex}:`, list.length, list);
        },
        error: err => console.error('❌ SubCategories error:', err)
      });
  }

  // ================= PAYMENT =================
  get isUPI():  boolean { return this.expenseHeader.paymentMode === 'UPI';  }
  get isBank(): boolean { return this.expenseHeader.paymentMode === 'Bank'; }

  onPaymentModeChange(): void {
    this.expenseHeader.paymentReference  = '';
    this.expenseHeader.bankName          = '';
    this.expenseHeader.bankAccountNumber = '';
    this.expenseHeader.ifscCode          = '';
  }

  // ================= GRID =================
  addRow(): void {
    this.gridData.push(this.getEmptyRow());
  }

  deleteRow(index: number): void {
    if (this.gridData.length === 1) {
      this.gridData[0] = this.getEmptyRow();
      return;
    }
    this.gridData.splice(index, 1);
  }

  onQtyRateChange(row: any): void {
    row.amount = (Number(row.quantity) || 0) * (Number(row.rate) || 0);
  }

  getTotalAmount(): number {
    return this.gridData.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  }

  // ================= BUILD PAYLOAD =================
  private buildPayloads(): any[] {
    return this.gridData.map(row => ({
      expenseID:            0,
      companyID:            this.toNum(this.expenseHeader.companyID),
      branchID:             this.toNum(this.expenseHeader.branchID),
      expenseDate:          new Date(this.expenseHeader.expenseDate).toISOString(),
      expenseCategoryID:    this.toNum(row.expenseCategoryID),
      expenseSubCategoryID: this.toNum(row.expenseSubCategoryID) ?? 0,
      description:          row.description   ?? '',
      paymentMode:          this.expenseHeader.paymentMode,
      paidTo:               this.expenseHeader.paidTo            ?? '',
      paymentReference:     this.expenseHeader.paymentReference  ?? '',
      paymentDate:          new Date(
                              this.expenseHeader.paymentDate ??
                              this.expenseHeader.expenseDate
                            ).toISOString(),
      bankName:             this.expenseHeader.bankName             ?? '',
      bankAccountNumber:    this.expenseHeader.bankAccountNumber    ?? '',
      ifscCode:             this.expenseHeader.ifscCode             ?? '',
      quantity:             Number(row.quantity) || 0,
      rate:                 Number(row.rate)     || 0,
      amount:               Number(row.amount)   || 0,
      expenseStatus:        this.expenseHeader.expenseStatus,
      isActive:             true,
      createdByUserID:      0,
      createdUserName:      '',
      createdSystemName:    '',
      updatedByUserID:      0,
      updatedUserName:      '',
      updatedSystemName:    ''
    }));
  }

  // ================= VALIDATION =================
  validate(): boolean {
    if (!this.expenseHeader.companyID) {
      this.swal.warning('Validation', 'Select Company'); return false;
    }
    if (!this.expenseHeader.branchID) {
      this.swal.warning('Validation', 'Select Branch'); return false;
    }
    if (!this.gridData.length) {
      this.swal.warning('Validation', 'Add at least one expense item'); return false;
    }
    for (let i = 0; i < this.gridData.length; i++) {
      const row = this.gridData[i];
      if (!row.expenseCategoryID) {
        this.swal.warning('Validation', `Row ${i + 1}: Select a Category`); return false;
      }
      if (!(Number(row.quantity) > 0)) {
        this.swal.warning('Validation', `Row ${i + 1}: Quantity must be > 0`); return false;
      }
      if (!(Number(row.rate) > 0)) {
        this.swal.warning('Validation', `Row ${i + 1}: Rate must be > 0`); return false;
      }
    }
    if (this.isUPI && !this.expenseHeader.paymentReference) {
      this.swal.warning('Validation', 'Enter UPI Reference'); return false;
    }
    if (this.isBank) {
      if (!this.expenseHeader.bankName) {
        this.swal.warning('Validation', 'Enter Bank Name'); return false;
      }
      if (!this.expenseHeader.bankAccountNumber) {
        this.swal.warning('Validation', 'Enter Account Number'); return false;
      }
      if (!this.expenseHeader.ifscCode) {
        this.swal.warning('Validation', 'Enter IFSC Code'); return false;
      }
    }
    return true;
  }

  // ================= SAVE =================
  save(): void {
    if (!this.validate()) return;

    const payloads = this.buildPayloads();
    console.log('📤 Saving', payloads.length, 'row(s):', payloads);
    this.isSaving = true;

    forkJoin(payloads.map(p => this.expenseService.saveExpenseEntry(p)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (responses: any[]) => {
          this.isSaving = false;
          console.log('✅ Responses:', responses);
          const allSuccess = responses.every(r => r?.success);
          const savedIDs   = responses.map(r => r?.data?.expenseID).filter(Boolean);
          console.log('🆔 Saved IDs:', savedIDs);
          if (allSuccess) {
            this.swal.success('Success',
              `${responses.length} expense row(s) saved successfully`);
            this.initForm();
          } else {
            const failed = responses.filter(r => !r?.success);
            this.swal.warning('Partial Save',
              `${failed.length} row(s) failed — check console`);
          }
        },
        error: (err: any) => {
          this.isSaving = false;
          console.error('❌ Save error:', err);
          this.swal.error('Error', 'Failed to save. Please try again.');
        }
      });
  }
}