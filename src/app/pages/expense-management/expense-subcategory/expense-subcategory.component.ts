import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ExpenseService } from '../../../services/expense.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';

import { MasterTableViewComponent } from '../../components/master-table-view/master-table-view.component';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-expense-subcategory',
  standalone: true,
  imports: [CommonModule, FormsModule, MasterTableViewComponent, SharedModule],
  templateUrl: './expense-subcategory.component.html',
  styleUrls: ['./expense-subcategory.component.css']
})
export class ExpenseSubcategoryComponent implements OnInit {

  companies: any[] = [];
  categories: any[] = [];
  subCategories: any[] = [];

  isEditMode = false;
  isFormEnabled = false;

  subCategory: any;

  constructor(
    private expenseService: ExpenseService,
    private commonService: CommonserviceService,
    private swal: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCompanies();

    const companyId = this.getCompanyId();
    if (companyId) {
      this.subCategory.companyID = companyId;
      this.loadCategories(companyId);
    }
  }

  // ================= TABLE =================
  columns = [
    { field: 'subCategoryName', header: 'SubCategory Name' },
    { field: 'subCategoryCode', header: 'Code' },
    { field: 'isActive', header: 'Active' }
  ];

  // ================= INIT =================
  initForm() {
    this.subCategory = this.getEmpty();
  }

  getEmpty() {
    return {
      expenseSubCategoryID: 0,
      companyID: this.getCompanyId(),
      branchID: null,
      expenseCategoryID: null,
      subCategoryCode: '',
      subCategoryName: '',
      description: '',
      isActive: true
    };
  }

  getCompanyId() {
    return Number(localStorage.getItem('companyID')) || 0;
  }

  // ================= LOAD =================

  loadCompanies() {
    this.commonService.getCompanies().subscribe({
      next: (res: any) => {
        this.companies = Array.isArray(res) ? res : res.data || [];
      },
      error: () => this.swal.error('Error', 'Failed to load companies')
    });
  }

  loadCategories(companyId: number) {
    this.expenseService.getCategories(companyId).subscribe({
      next: (res: any) => {
        this.categories = Array.isArray(res) ? res : res.data || [];
      },
      error: () => this.swal.error('Error', 'Failed to load categories')
    });
  }

  loadSubCategories() {
    if (!this.subCategory.companyID || !this.subCategory.expenseCategoryID) return;

    this.expenseService
      .getSubCategories(this.subCategory.companyID, this.subCategory.expenseCategoryID)
      .subscribe({
        next: (res: any) => {
          this.subCategories = Array.isArray(res) ? res : res.data || [];
        },
        error: () => this.swal.error('Error', 'Failed to load subcategories')
      });
  }

  // ================= CODE GENERATION =================

  generateSubCategoryCode() {
    if (!this.subCategory.companyID) return;

    const company = this.companies.find(
      (c: any) => c.companyID == this.subCategory.companyID
    );

    if (!company) return;

    const name = company.companyName.replace(/\s+/g, '').toUpperCase();
    const nextNo = (this.subCategories.length + 1).toString().padStart(2, '0');

    this.subCategory.subCategoryCode = `SUB-${name}-${nextNo}`;
  }

  // ================= EVENTS =================

  onCompanyChange(companyId: number) {
    this.categories = [];
    this.subCategories = [];

    if (companyId) {
      this.loadCategories(companyId);
      this.generateSubCategoryCode();
    }
  }

  onCategoryChange() {
    this.subCategories = [];
    this.loadSubCategories();
    this.generateSubCategoryCode();
  }

  // ================= FORM =================

  newSubCategory() {
    this.initForm();
    this.isEditMode = false;
    this.isFormEnabled = true;
    this.generateSubCategoryCode();
  }

  reset() {
    this.initForm();
    this.isEditMode = false;
    this.isFormEnabled = false;
  }

  // ================= SAVE =================

  save() {
    if (
      !this.subCategory.companyID ||
      !this.subCategory.expenseCategoryID ||
      !this.subCategory.subCategoryName
    ) {
      this.swal.warning('Warning', 'Company, Category & Name required');
      return;
    }

    this.expenseService.saveSubCategory(this.subCategory).subscribe({
      next: () => {
        this.swal.success('Success', 'Saved successfully');
        this.loadSubCategories();
        this.reset();
      },
      error: (err) => {
        this.swal.error('Error', err?.error?.message || 'Save failed');
      }
    });
  }

  // ================= EDIT =================

  edit(row: any) {
    this.subCategory = { ...row };
    this.isEditMode = true;
    this.isFormEnabled = true;

    if (row.companyID) {
      this.loadCategories(row.companyID);
    }

    if (row.expenseCategoryID) {
      this.loadSubCategories();
    }
  }

  // ================= DELETE =================

  delete(row: any) {
    if (!confirm(`Delete ${row.subCategoryName}?`)) return;

    const payload = { ...row, isActive: false };

    this.expenseService.saveSubCategory(payload).subscribe({
      next: () => {
        this.swal.success('Deleted', 'SubCategory deleted');
        this.loadSubCategories();
      },
      error: () => {
        this.swal.error('Error', 'Delete failed');
      }
    });
  }
}