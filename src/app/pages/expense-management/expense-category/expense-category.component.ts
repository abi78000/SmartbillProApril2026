import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DynamicTableComponent } from '../../../framework/dynamic-table/dynamic-table.component';

import { ReusableFormComponent } from '../../../framework/reusable-form/reusable-form.component';

import { SharedModule } from '../../../shared/shared.module';

import { ExpenseService } from '../../../services/expense.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';

@Component({
  selector: 'app-expense-category',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DynamicTableComponent,
    ReusableFormComponent,
  ],

  templateUrl: './expense-category.component.html',
  styleUrls: ['./expense-category.component.css'],
})
export class ExpenseCategoryComponent implements OnInit {
  showForm = false;

  isEditMode = false;

  formTitle = 'New Expense Category';

  companies: any[] = [];

  branches: any[] = [];

  categories: any[] = [];

  category: any = {};

  /*================ TABLE =================*/

  categoryColumns = [
    {
      field: 'categoryName',
      header: 'Category Name',
    },

    {
      field: 'categoryCode',
      header: 'Code',
    },

    {
      field: 'isActive',
      header: 'Status',
    },
  ];

  /*================ TABS =================*/

  categoryTabs = ['Details', 'Settings'];

  /*================ FIELDS =================*/

  categoryFields: any[] = [
    {
      label: 'Company',

      model: 'companyID',

      type: 'select',

      required: true,

      tab: 'Details',

      options: [] as any[],
    },

    {
      label: 'Branch',

      model: 'branchID',

      type: 'select',

      tab: 'Details',

      options: [] as any[],
    },

    {
      label: 'Category Code',

      model: 'categoryCode',

      type: 'text',

      readonly: true,

      tab: 'Details',
    },

    {
      label: 'Category Name',

      model: 'categoryName',

      type: 'text',

      required: true,

      tab: 'Details',
    },

    {
      label: 'Description',

      model: 'description',

      type: 'textarea',

      tab: 'Details',
    },

    {
      label: 'Is Active',

      model: 'isActive',

      type: 'checkbox',

      tab: 'Settings',
    },
  ];

  constructor(
    private expenseService: ExpenseService,

    private commonService: CommonserviceService,

    private swal: SweetAlertService,
  ) {}

  ngOnInit() {
    this.resetCategory();

    this.loadCompanies();

    const companyId = this.getCompanyId();

    if (companyId) {
      this.category.companyID = companyId;

      this.loadBranches(companyId);

      this.loadCategories(companyId);

      this.generateCategoryCode();
    }
  }

  /*================ COMPANY ID =================*/

  getCompanyId() {
    return Number(localStorage.getItem('companyID')) || 0;
  }

  /*================ LOAD COMPANY =================*/

  loadCompanies() {
    this.commonService.getCompanies().subscribe({
      next: (res: any) => {
        this.companies = Array.isArray(res) ? res : res.data || [];

        const field = this.categoryFields.find(
          (x: any) => x.model === 'companyID',
        );

        if (field) {
          field.options = this.companies.map((x: any) => ({
            label: x.companyName,

            value: x.companyID,
          }));
        }
      },
    });
  }

  /*================ LOAD BRANCH =================*/

  loadBranches(companyId: number) {
    this.commonService.getBranchesByCompany(companyId).subscribe({
      next: (res: any) => {
        this.branches = Array.isArray(res) ? res : res.data || [];

        const field = this.categoryFields.find(
          (x: any) => x.model === 'branchID',
        );

        if (field) {
          field.options = this.branches.map((x: any) => ({
            label: x.branchName,

            value: x.branchID,
          }));
        }
      },
    });
  }

  /*================ LOAD CATEGORY =================*/

  loadCategories(companyId: number) {
    this.expenseService.getCategories(companyId).subscribe({
      next: (res: any) => {
        this.categories = (Array.isArray(res) ? res : res.data || []).map(
          (x: any) => ({
            ...x,

            statusText: x.isActive ? 'Active' : 'Inactive',
          }),
        );
      },
    });
  }

  /*================ CODE =================*/

  generateCategoryCode() {
    if (!this.category.companyID) return;

    const company = this.companies.find(
      (c: any) => c.companyID == this.category.companyID,
    );

    if (!company) return;

    const name = company.companyName
      .replace(/\s+/g, '')

      .toUpperCase();

    const nextNo = (this.categories.length + 1)

      .toString()

      .padStart(2, '0');

    this.category.categoryCode = `CAT-${name}-${nextNo}`;
  }

  /*================ NEW =================*/

  newCategory() {
    this.resetCategory();

    this.showForm = true;

    this.isEditMode = false;

    this.formTitle = 'New Expense Category';

    const companyId = this.getCompanyId();

    if (companyId) {
      this.category.companyID = companyId;

      this.loadBranches(companyId);

      this.loadCategories(companyId);

      this.generateCategoryCode();
    }
  }

  /*================ EDIT =================*/

  editCategory(row: any) {
    this.category = { ...row };

    this.showForm = true;

    this.isEditMode = true;

    this.formTitle = 'Edit Expense Category';

    if (row.companyID) {
      this.loadBranches(row.companyID);
    }
  }

  /*================ FIELD =================*/

  onFieldChange(event: any) {
    this.category[event.field] = event.value;

    if (event.field === 'companyID') {
      this.loadBranches(event.value);

      this.loadCategories(event.value);

      this.generateCategoryCode();
    }
  }

  /*================ SAVE =================*/

  saveCategory() {
    if (!this.category.companyID || !this.category.categoryName) {
      return this.swal.warning(
        'Validation',

        'Company & Category Required',
      );
    }

    this.expenseService.saveCategory(this.category).subscribe({
      next: () => {
        this.swal.success(
          'Success',

          this.isEditMode ? 'Updated' : 'Saved',
        );

        this.loadCategories(this.category.companyID);

        this.cancelForm();
      },

      error: () => {
        this.swal.error(
          'Error',

          'Save Failed',
        );
      },
    });
  }

  /*================ DELETE =================*/

  deleteCategory(row: any) {
    const payload = {
      ...row,

      isActive: false,
    };

    this.expenseService.saveCategory(payload).subscribe({
      next: () => {
        this.swal.success(
          'Deleted',

          'Category Deleted',
        );

        this.loadCategories(row.companyID);
      },
    });
  }

  /*================ REFRESH =================*/

  refreshCategories() {
    this.cancelForm();

    const companyId = this.getCompanyId();

    if (companyId) {
      this.loadCategories(companyId);
    }
  }

  /*================ CANCEL =================*/

  cancelForm() {
    this.showForm = false;

    this.resetCategory();
  }

  /*================ RESET =================*/

  resetCategory() {
    this.category = {
      expenseCategoryID: 0,

      companyID: this.getCompanyId(),

      branchID: 0,

      categoryCode: '',

      categoryName: '',

      description: '',

      isActive: true,
    };
  }
}
