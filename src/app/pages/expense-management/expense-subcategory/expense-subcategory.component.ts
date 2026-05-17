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
  selector: 'app-expense-subcategory',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DynamicTableComponent,
    ReusableFormComponent,
  ],

  templateUrl: './expense-subcategory.component.html',

  styleUrls: ['./expense-subcategory.component.css'],
})
export class ExpenseSubcategoryComponent implements OnInit {
  showForm = false;

  isEditMode = false;

  formTitle = 'New Expense SubCategory';

  companies: any[] = [];

  categories: any[] = [];

  subCategories: any[] = [];

  subCategory: any = {};

  /*================ TABLE =================*/

  subCategoryColumns = [
    {
      field: 'subCategoryName',
      header: 'SubCategory',
    },

    {
      field: 'subCategoryCode',
      header: 'Code',
    },

    {
      field: 'isActive',
      header: 'Status',
    },
  ];

  /*================ TABS =================*/

  subCategoryTabs = ['Details', 'Settings'];

  /*================ FIELDS =================*/

  subCategoryFields: any[] = [
    {
      label: 'Company',

      model: 'companyID',

      type: 'select',

      required: true,

      tab: 'Details',

      options: [] as any[],
    },

    {
      label: 'Category',

      model: 'expenseCategoryID',

      type: 'select',

      required: true,

      tab: 'Details',

      options: [] as any[],
    },

    {
      label: 'SubCategory Code',

      model: 'subCategoryCode',

      type: 'text',

      readonly: true,

      tab: 'Details',
    },

    {
      label: 'SubCategory Name',

      model: 'subCategoryName',

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
    this.resetSubCategory();

    this.loadCompanies();
  }

  /*================ LOAD =================*/

  loadCompanies() {
    this.commonService.getCompanies().subscribe({
      next: (res: any) => {
        this.companies = Array.isArray(res) ? res : res.data || [];

        const field = this.subCategoryFields.find(
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

  loadCategories(companyId: number) {
    this.expenseService.getCategories(companyId).subscribe({
      next: (res: any) => {
        this.categories = Array.isArray(res) ? res : res.data || [];

        const field = this.subCategoryFields.find(
          (x: any) => x.model === 'expenseCategoryID',
        );

        if (field) {
          field.options = this.categories.map((x: any) => ({
            label: x.categoryName,
            value: x.expenseCategoryID,
          }));
        }
      },
    });
  }

  loadSubCategories() {
    if (!this.subCategory.companyID || !this.subCategory.expenseCategoryID)
      return;

    this.expenseService
      .getSubCategories(
        this.subCategory.companyID,
        this.subCategory.expenseCategoryID,
      )
      .subscribe({
        next: (res: any) => {
          this.subCategories = (Array.isArray(res) ? res : res.data || []).map(
            (x: any) => ({
              ...x,

              statusText: x.isActive ? 'Active' : 'Inactive',
            }),
          );
        },
      });
  }

  /*================ FORM =================*/

  newSubCategory() {
    this.resetSubCategory();

    this.showForm = true;

    this.isEditMode = false;

    this.formTitle = 'New Expense SubCategory';
  }

  editSubCategory(row: any) {
    this.subCategory = { ...row };

    this.showForm = true;

    this.isEditMode = true;

    this.formTitle = 'Edit Expense SubCategory';

    this.loadCategories(row.companyID);
  }

  /*================ FIELD =================*/

  onFieldChange(event: any) {
    this.subCategory[event.field] = event.value;

    if (event.field === 'companyID') {
      this.loadCategories(event.value);
    }

    if (event.field === 'expenseCategoryID') {
      this.loadSubCategories();
    }
  }

  /*================ SAVE =================*/

  saveSubCategory() {
    if (
      !this.subCategory.companyID ||
      !this.subCategory.expenseCategoryID ||
      !this.subCategory.subCategoryName
    ) {
      return this.swal.warning('Validation', 'Required fields missing');
    }

    this.expenseService.saveSubCategory(this.subCategory).subscribe({
      next: () => {
        this.swal.success('Success', 'Saved Successfully');

        this.loadSubCategories();

        this.cancelForm();
      },
    });
  }

  /*================ DELETE =================*/

  deleteSubCategory(row: any) {
    const payload = {
      ...row,

      isActive: false,
    };

    this.expenseService.saveSubCategory(payload).subscribe({
      next: () => {
        this.swal.success('Deleted', 'SubCategory Deleted');

        this.loadSubCategories();
      },
    });
  }

  /*================ CANCEL =================*/

  cancelForm() {
    this.showForm = false;

    this.resetSubCategory();
  }

  /*================ REFRESH =================*/

  refreshSubCategories() {
    this.cancelForm();

    this.loadSubCategories();
  }

  /*================ RESET =================*/

  resetSubCategory() {
    this.subCategory = {
      expenseSubCategoryID: 0,

      companyID: 0,

      expenseCategoryID: 0,

      subCategoryCode: '',

      subCategoryName: '',

      description: '',

      isActive: true,
    };
  }
}
