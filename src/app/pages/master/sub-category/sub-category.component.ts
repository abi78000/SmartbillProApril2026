import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../../../services/master.service';
import { ValidationService } from '../../../services/properties/validation.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { FocusOnKeyDirective } from '../../../directives/focus-on-key.directive';
import { Category, SubCategory } from '../../models/common-models/master-models/master';
import { CommonserviceService } from '../../../services/commonservice.service';
import { MasterTableViewComponent } from '../../components/master-table-view/master-table-view.component';
import { share } from 'rxjs';
import { SharedModule } from '../../../shared/shared.module';


interface ApiResponse {
  success: boolean;
  message?: string;
}

@Component({
  selector: 'app-sub-category',
   standalone: true,
  imports: [CommonModule, FormsModule, FocusOnKeyDirective,MasterTableViewComponent,SharedModule],
  templateUrl: './sub-category.component.html',
  styleUrls: ['./sub-category.component.css']
})
export class SubCategoryComponent {
   subCategories: SubCategory[] = [];
  categories: Category[] = [];
  subCategory: SubCategory = this.newSubCategory();
  duplicateError = false;
  subCategoryColumns = [
    { field: 'subCategoryName', header: 'SubCategory Name' },
    { field: 'categoryName', header: 'Category Name' },
    { field: 'isActive', header: 'Active' },
  ];
  isEditMode = false;
  isFormEnabled = false;

  constructor(
    private readonly masterService: MasterService,
    private readonly swall: SweetAlertService,
    private readonly commonservice: CommonserviceService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadSubCategories();
  }

    newSubCategoryCreate() {
    this.resetSubCategory();
    this.isEditMode = false;
    this.isFormEnabled = true;
  }
  refreshSubCategories() {
    this.resetSubCategory();
    this.isEditMode = false;
    this.isFormEnabled = false;
  }
  /** Create new blank subcategory */
  private newSubCategory(): SubCategory {
    const now = new Date().toISOString();
    return {
      subCategoryID: 0,
      subCategoryName: '',
      categoryID: 0,
      description: '',
      isActive: true,
      createdByUserID: 0,
      createdSystemName: 'AngularApp',
      createdAt: now,
      updatedByUserID: 0,
      updatedSystemName: 'AngularApp',
      updatedAt: now
    };
  }

  /** Focus helper */
  private focusSubCategory() {
    setTimeout(() => {
      const el = document.getElementById('subCategoryName') as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 0);
  }

  /** Load all categories */
  loadCategories() {
    this.masterService.getCategories().subscribe({
      next: res => (this.categories = res ?? []),
      error: () => this.swall.error('Error', 'Failed to load categories!')
    });
  }

  /** Load subcategories optionally filtered by category */
  loadSubCategories(categoryId?: number) {
    this.masterService.getSubCategories(categoryId).subscribe({
      next: res => (this.subCategories = res ?? []),
      error: () => this.swall.error('Error', 'Failed to load subcategories!')
    });
  }

  /** Check for duplicates in current category */
  checkDuplicate() {
    const name = this.subCategory.subCategoryName?.trim().toLowerCase() || '';
    const catId = this.subCategory.categoryID;

    if (!name || !catId) {
      this.duplicateError = false;
      return;
    }

    this.duplicateError = this.subCategories.some(sc =>
      sc.subCategoryName.trim().toLowerCase() === name &&
      sc.categoryID === catId &&
      sc.subCategoryID !== this.subCategory.subCategoryID
    );
  }

  /** Validate before save/update */
  private validateSubCategory(): boolean {
    this.subCategory.subCategoryName = this.subCategory.subCategoryName?.trim() || '';
    this.checkDuplicate();

    if (!this.subCategory.categoryID) {
      this.swall.warning('Validation', 'Please select a Category!');
      return false;
    }

    if (!this.subCategory.subCategoryName) {
      this.swall.warning('Validation', 'SubCategory Name is required!', () => this.focusSubCategory());
      return false;
    }

    if (this.duplicateError) {
      this.swall.warning('Validation', 'SubCategory already exists!', () => this.focusSubCategory());
      return false;
    }

    return true;
  }

  /** Save or Update with backend duplicate check */
  saveOrUpdateSubCategory() {
    if (!this.subCategory.categoryID || !this.subCategory.subCategoryName?.trim()) {
      this.swall.warning('Validation', 'Please fill required fields!');
      return;
    }

    // Fetch latest subcategories for the current category before saving
    this.masterService.getSubCategories(this.subCategory.categoryID).subscribe({
      next: (latestSubCats) => {
        const nameToCheck = this.subCategory.subCategoryName.trim().toLowerCase();
        const duplicate = latestSubCats.some(sc =>
          sc.subCategoryName.trim().toLowerCase() === nameToCheck &&
          sc.subCategoryID !== this.subCategory.subCategoryID
        );

        if (duplicate) {
          this.swall.warning('Validation', 'SubCategory already exists!');
          return;
        }

        // Proceed to save
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
          next: (res: ApiResponse) => {
            if (res.success) {
              this.loadSubCategories(this.subCategory.categoryID);
              this.resetSubCategory();
              this.swall.success('Success', res.message || 'SubCategory saved successfully!');
            } else {
              this.swall.error('Error', res.message || 'Something went wrong!');
            }
          },
          error: () => this.swall.error('Error', 'Failed to save subcategory!')
        });
      },
      error: () => this.swall.error('Error', 'Failed to validate duplicates!')
    });
  }

  /** Edit subcategory */
  editSubCategory(sc: SubCategory) {
    this.subCategory = { ...sc };
    this.checkDuplicate(); // update duplicate error
    this.focusSubCategory();
  }

  /** Delete subcategory */
  deleteSubCategory(sc: SubCategory) {
    this.swall.confirm(`Delete ${sc.subCategoryName}?`, 'This will mark it as inactive.').then(result => {
      if (!result.isConfirmed) return;

      const userId = this.commonservice.getCurrentUserId();
      const deleted = {
        ...sc,
        isActive: false,
        updatedByUserID: userId,
        updatedAt: new Date().toISOString()
      };

      this.masterService.saveSubCategory(deleted).subscribe({
        next: (res: ApiResponse) => {
          if (res.success) {
            this.loadSubCategories();
            this.swall.success('Deleted!', res.message || 'SubCategory deleted successfully!');
          } else {
            this.swall.error('Error', res.message || 'Failed to delete!');
          }
        },
        error: () => this.swall.error('Error', 'Failed to delete!')
      });
    });
  }

  /** Reset form */
  resetSubCategory() {
    this.subCategory = this.newSubCategory();
    this.duplicateError = false;
    this.focusSubCategory();
  }

  /** Filter subcategories by category */
  filterByCategory(event: any) {
    const categoryId = +event.target.value || undefined;
    this.loadSubCategories(categoryId);
  }

  /** Get category name by ID */
  getCategoryName(categoryID: number): string {
    return this.categories.find(c => c.categoryID === categoryID)?.categoryName || '-';
  }}