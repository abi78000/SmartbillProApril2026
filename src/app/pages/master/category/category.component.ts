import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DynamicTableComponent } from '../../../framework/dynamic-table/dynamic-table.component';

import { ReusableFormComponent } from '../../../framework/reusable-form/reusable-form.component';

import { MasterService } from '../../../services/master.service';

import { ValidationService } from '../../../services/properties/validation.service';

import { SweetAlertService } from '../../../services/properties/sweet-alert.service';

@Component({
  selector: 'app-category',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    DynamicTableComponent,
    ReusableFormComponent,
  ],

  templateUrl: './category.component.html',

  styleUrls: ['./category.component.css'],
})
export class CategoryComponent implements OnInit {
  showForm = false;

  duplicateError = false;

  isEditMode = false;

  formTitle = 'New Category';

  categories: any[] = [];

  category: any = {};

  /*================ TABS =================*/

  categoryTabs = ['Details', 'Settings'];

  /*================ TABLE =================*/

  categoryColumns = [
    {
      field: 'categoryName',
      header: 'Category Name',
    },

    {
      field: 'description',
      header: 'Description',
    },

    {
      field: 'statusText',
      header: 'Status',
    },
  ];

  /*================ FIELDS =================*/

  categoryFields = [
    {
      label: 'Category Name',

      model: 'categoryName',

      type: 'text',

      required: true,

      tab: 'Details',

      autoFocus: true,
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
    private masterService: MasterService,

    private validationService: ValidationService,

    private swal: SweetAlertService,
  ) {}

  ngOnInit() {
    this.resetCategory();

    this.loadCategories();
  }

  /*================ LOAD =================*/

  loadCategories() {
    this.masterService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.map((x: any) => ({
          ...x,

          statusText: x.isActive ? 'Active' : 'Inactive',
        }));
      },

      error: () => {
        this.swal.error('Error', 'Load Failed');
      },
    });
  }

  /*================ ADD =================*/

  newCategory() {
    this.resetCategory();

    this.showForm = true;

    this.formTitle = 'New Category';

    this.isEditMode = false;
  }

  /*================ EDIT =================*/

  editCategory(row: any) {
    this.category = {
      ...row,
    };

    this.showForm = true;

    this.formTitle = 'Edit Category';

    this.isEditMode = true;
  }

  /*================ FIELD CHANGE =================*/

  onFieldChange(event: any) {
    if (event.field === 'categoryName') {
      this.checkDuplicate();
    }
  }

  /*================ DUPLICATE =================*/

  checkDuplicate() {
    this.duplicateError = this.validationService.isDuplicate(
      this.category.categoryName,

      this.categories,

      'categoryName',

      this.category.categoryID,
    );
  }

  /*================ SAVE =================*/

  saveOrUpdateCategory() {
    this.checkDuplicate();

    if (!this.category.categoryName) {
      return this.swal.warning(
        'Validation',

        'Category Required',
      );
    }

    if (this.duplicateError) {
      return this.swal.warning(
        'Validation',

        'Category Already Exists',
      );
    }

    this.masterService.saveCategory(this.category).subscribe({
      next: () => {
        this.swal.success(
          'Success',

          this.isEditMode ? 'Updated' : 'Saved',
        );

        this.loadCategories();

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
    row.isActive = false;

    this.masterService.saveCategory(row).subscribe({
      next: () => {
        this.swal.success(
          'Success',

          'Deleted',
        );

        this.loadCategories();
      },
    });
  }

  /*================ REFRESH =================*/

  refreshCategories() {
    this.cancelForm();

    this.loadCategories();
  }

  /*================ CANCEL =================*/

  cancelForm() {
    this.showForm = false;

    this.resetCategory();
  }

  /*================ RESET =================*/

  resetCategory() {
    this.category = {
      categoryID: 0,

      categoryName: '',

      description: '',

      isActive: true,
    };
  }
}
