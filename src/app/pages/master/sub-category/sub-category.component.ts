import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../../shared/shared.module';

import { DynamicTableComponent } from '../../../framework/dynamic-table/dynamic-table.component';

import { ReusableFormComponent } from '../../../framework/reusable-form/reusable-form.component';

import { MasterService } from '../../../services/master.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { CommonserviceService } from '../../../services/commonservice.service';

@Component({
  selector: 'app-sub-category',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    DynamicTableComponent,
    ReusableFormComponent,
  ],

  templateUrl: './sub-category.component.html',
  styleUrls: ['./sub-category.component.css'],
})
export class SubCategoryComponent implements OnInit {
  showForm = false;

  duplicateError = false;

  isEditMode = false;

  formTitle = 'New SubCategory';

  subCategories: any[] = [];

  categories: any[] = [];

  subCategory: any = {};

  /*================ TABS =================*/

  subCategoryTabs = ['Details', 'Settings'];

  /*================ TABLE =================*/

  subCategoryColumns = [
    {
      field: 'subCategoryName',
      header: 'SubCategory',
    },

    {
      field: 'categoryName',
      header: 'Category',
    },

    {
      field: 'isActive',
      header: 'Status',
    },
  ];

  /*================ FIELDS =================*/

  subCategoryFields: any[] = [
    {
      label: 'Category',

      model: 'categoryID',

      type: 'select',

      required: true,

      tab: 'Details',

      options: [] as any[],
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
    private masterService: MasterService,

    private swall: SweetAlertService,

    private commonservice: CommonserviceService,
  ) {}

  ngOnInit() {
    this.loadCategories();

    this.loadSubCategories();

    this.resetSubCategory();
  }

  /*================ CATEGORY =================*/

  loadCategories() {
    this.masterService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res || [];

        const field = this.subCategoryFields.find(
          (x: any) => x.model === 'categoryID',
        );

        if (field) {
          field.options = this.categories.map((x: any) => ({
            label: x.categoryName,
            value: x.categoryID,
          }));
        }
      },

      error: () => {
        this.swall.error('Error', 'Category Load Failed');
      },
    });
  }

  /*================ SUBCATEGORY =================*/

  loadSubCategories(categoryId?: number) {
    this.masterService.getSubCategories(categoryId).subscribe({
      next: (res: any) => {
        this.subCategories = (res || []).map((x: any) => ({
          ...x,

          categoryName:
            this.categories.find((c: any) => c.categoryID === x.categoryID)
              ?.categoryName || '',

          statusText: x.isActive ? 'Active' : 'Inactive',
        }));
      },

      error: () => {
        this.swall.error('Error', 'SubCategory Load Failed');
      },
    });
  }

  /*================ ADD =================*/

  newSubCategory() {
    this.resetSubCategory();

    this.showForm = true;

    this.isEditMode = false;

    this.formTitle = 'New SubCategory';
  }

  /*================ EDIT =================*/

  editSubCategory(row: any) {
    this.subCategory = {
      ...row,
    };

    this.showForm = true;

    this.isEditMode = true;

    this.formTitle = 'Edit SubCategory';
  }

  /*================ FIELD CHANGE =================*/

  onFieldChange(event: any) {
    this.subCategory[event.field] = event.value;

    if (event.field === 'subCategoryName') {
      this.checkDuplicate();
    }
  }

  /*================ DUPLICATE =================*/

  checkDuplicate() {
    const name = this.subCategory.subCategoryName?.trim().toLowerCase();

    const categoryID = this.subCategory.categoryID;

    this.duplicateError = this.subCategories.some(
      (x: any) =>
        x.subCategoryName.trim().toLowerCase() === name &&
        x.categoryID === categoryID &&
        x.subCategoryID !== this.subCategory.subCategoryID,
    );
  }

  /*================ SAVE =================*/

  saveOrUpdateSubCategory() {
    this.checkDuplicate();

    if (!this.subCategory.categoryID) {
      return this.swall.warning(
        'Validation',

        'Select Category',
      );
    }

    if (!this.subCategory.subCategoryName) {
      return this.swall.warning(
        'Validation',

        'SubCategory Required',
      );
    }

    if (this.duplicateError) {
      return this.swall.warning(
        'Validation',

        'SubCategory Exists',
      );
    }

    const userId = this.commonservice.getCurrentUserId();

    const now = new Date().toISOString();

    if (this.subCategory.subCategoryID === 0) {
      this.subCategory.createdByUserID = userId;

      this.subCategory.createdAt = now;
    } else {
      this.subCategory.updatedByUserID = userId;

      this.subCategory.updatedAt = now;
    }

    this.masterService.saveSubCategory(this.subCategory).subscribe({
      next: () => {
        this.swall.success(
          'Success',

          this.isEditMode ? 'Updated' : 'Saved',
        );

        this.loadSubCategories();

        this.cancelForm();
      },

      error: () => {
        this.swall.error(
          'Error',

          'Save Failed',
        );
      },
    });
  }

  /*================ DELETE =================*/

  deleteSubCategory(row: any) {
    row.isActive = false;

    row.updatedByUserID = this.commonservice.getCurrentUserId();

    row.updatedAt = new Date().toISOString();

    this.masterService.saveSubCategory(row).subscribe({
      next: () => {
        this.swall.success(
          'Success',

          'Deleted',
        );

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
      subCategoryID: 0,

      subCategoryName: '',

      categoryID: 0,

      description: '',

      isActive: true,
    };
  }
}
