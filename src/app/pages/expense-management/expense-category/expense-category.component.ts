import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ExpenseService } from '../../../services/expense.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';

import { MasterTableViewComponent } from '../../components/master-table-view/master-table-view.component';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-expense-category',
  standalone: true,
  imports: [CommonModule, FormsModule, MasterTableViewComponent, SharedModule],
  templateUrl: './expense-category.component.html',
  styleUrls: ['./expense-category.component.css']
})
export class ExpenseCategoryComponent implements OnInit {

  companies: any[] = [];
  branches: any[] = [];
  categories: any[] = [];

  isEditMode = false;
  isFormEnabled = false;

  category: any;

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
      this.category.companyID = companyId;
      this.loadBranches(companyId);
      this.loadCategories(companyId);
      this.generateCategoryCode();
    }
  }

  // ================= TABLE =================
  columns = [
    { field: 'categoryName', header: 'Category Name' },
    { field: 'categoryCode', header: 'Code' },
    { field: 'isActive', header: 'Active' }
  ];

  // ================= INIT =================
  initForm() {
    this.category = this.getEmpty();
  }

  getEmpty() {
    return {
      expenseCategoryID: 0,
      companyID: this.getCompanyId(),
      branchID: null,
      categoryCode: '',
      categoryName: '',
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
      }
    });
  }

  loadBranches(companyId: number) {
    this.commonService.getBranchesByCompany(companyId).subscribe({
      next: (res: any) => {
        this.branches = Array.isArray(res) ? res : res.data || [];
      }
    });
  }

  loadCategories(companyId: number) {
    this.expenseService.getCategories(companyId).subscribe({
      next: (res: any) => {
        this.categories = Array.isArray(res) ? res : res.data || [];
      }
    });
  }

  // ================= CODE GENERATION =================

  generateCategoryCode() {
    if (!this.category.companyID) return;

    const company = this.companies.find(
      (c: any) => c.companyID == this.category.companyID
    );

    if (!company) return;

    const name = company.companyName.replace(/\s+/g, '').toUpperCase();
    const nextNo = (this.categories.length + 1).toString().padStart(2, '0');

    this.category.categoryCode = `CAT-${name}-${nextNo}`;
  }

  // ================= EVENTS =================

  onCompanyChange(companyId: number) {
    this.branches = [];
    this.categories = [];

    if (companyId) {
      this.loadBranches(companyId);
      this.loadCategories(companyId);
      this.generateCategoryCode();
    }
  }

  // ================= FORM =================

  newCategory() {
    this.initForm();
    this.isEditMode = false;
    this.isFormEnabled = true;
    this.generateCategoryCode();
  }

  reset() {
    this.initForm();
    this.isEditMode = false;
    this.isFormEnabled = false;
  }

  // ================= SAVE =================

  save() {
    if (!this.category.companyID || !this.category.categoryName) {
      this.swal.warning('Warning', 'Company & Category Name required');
      return;
    }

    this.expenseService.saveCategory(this.category).subscribe({
      next: () => {
        this.swal.success('Success', 'Saved successfully');
        this.loadCategories(this.category.companyID);
        this.reset();
      }
    });
  }

  // ================= EDIT =================

  edit(row: any) {
    this.category = { ...row };
    this.isEditMode = true;
    this.isFormEnabled = true;

    if (row.companyID) {
      this.loadBranches(row.companyID);
    }
  }

  // ================= DELETE =================

  delete(row: any) {
    if (!confirm(`Delete ${row.categoryName}?`)) return;

    const payload = { ...row, isActive: false };

    this.expenseService.saveCategory(payload).subscribe(() => {
      this.swal.success('Deleted', 'Category deleted');
      this.loadCategories(row.companyID);
    });
  }
}