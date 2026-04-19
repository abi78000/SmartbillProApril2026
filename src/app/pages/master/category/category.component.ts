import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../../../services/master.service';
import { ValidationService } from '../../../services/properties/validation.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { FocusOnKeyDirective } from '../../../directives/focus-on-key.directive';
import { Category } from '../../models/common-models/master-models/master';
import { MasterTableViewComponent } from '../../components/master-table-view/master-table-view.component';
import { SharedModule } from '../../../shared/shared.module';

interface ApiResponse {
  success: boolean;
  message?: string;
}
@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    FocusOnKeyDirective,
    MasterTableViewComponent,
    SharedModule,
  ],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
})
export class CategoryComponent {
  categories: Category[] = [];
  category: Category = this.newCategory();
  duplicateError = false;
  isEditMode = false;
  isFormEnabled = false;

  constructor(
    private readonly categoryService: MasterService,
    private readonly validationService: ValidationService,
    private readonly swall: SweetAlertService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.isFormEnabled = false;
  }
  categoryColumns = [
    { field: 'categoryName', header: 'Category Name' },
    { field: 'isActive', header: 'Active' },
  ];


  newCategories() {
    this.resetCategory();
    this.isEditMode = false;
    this.isFormEnabled = true;
  }
  refreshCategories() {
    this.resetCategory();
    this.isEditMode = false;
    this.isFormEnabled = false;
  }


  
  private newCategory(): Category {
    const now = new Date().toISOString();
    return {
      categoryID: 0,
      categoryName: '',
      description: '',
      isActive: true,
      createdByUserID: 0,
      createdSystemName: 'AngularApp',
      createdAt: now,
      updatedByUserID: 0,
      updatedSystemName: 'AngularApp',
      updatedAt: now,
    };
  }

  private focusCategory() {
    setTimeout(() => {
      const el = document.getElementById(
        'categoryName'
      ) as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 0);
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (res) => (this.categories = res ?? []),
      error: () =>
        this.swall.error('Error', 'Failed to load categories!', () =>
          this.focusCategory()
        ),
    });
  }

  checkDuplicate() {
    this.duplicateError = this.validationService.isDuplicate(
      this.category.categoryName,
      this.categories,
      'categoryName',
      this.category.categoryID
    );
  }

  private validateCategory(): boolean {
    this.category.categoryName = this.category.categoryName?.trim() || '';
    this.checkDuplicate();
    if (!this.category.categoryName) {
      this.swall.warning('Validation', 'Category Name is required!', () =>
        this.focusCategory()
      );
      return false;
    }
    if (this.duplicateError) {
      this.swall.warning('Validation', 'Category already exists!', () =>
        this.focusCategory()
      );
      return false;
    }
    return true;
  }

  saveOrUpdateCategory() {
    if (!this.validateCategory()) return;
    this.categoryService.saveCategory(this.category).subscribe({
      next: (res: ApiResponse) => {
        if (res.success) {
          this.loadCategories();
          this.resetCategory();
          this.swall.success(
            'Success',
            res.message || 'Category saved successfully!',
            () => this.focusCategory()
          );
        } else
          this.swall.error(
            'Error',
            res.message || 'Something went wrong!',
            () => this.focusCategory()
          );
      },
      error: () =>
        this.swall.error('Error', 'Failed to save category!', () =>
          this.focusCategory()
        ),
    });
  }

  editCategory(c: Category) {
    this.category = { ...c };
    this.focusCategory();
  }

  deleteCategory(c: Category) {
    this.swall
      .confirm(
        `Delete ${c.categoryName}?`,
        'This will mark the category as inactive.'
      )
      .then((result) => {
        if (!result.isConfirmed) return;
        const deleted: Category = { ...c, isActive: false };
        this.categoryService.saveCategory(deleted).subscribe({
          next: (res: ApiResponse) =>
            res.success
              ? (this.loadCategories(),
                this.swall.success(
                  'Deleted!',
                  res.message || 'Category deleted!',
                  () => this.focusCategory()
                ))
              : this.swall.error(
                  'Error',
                  res.message || 'Failed to delete category!',
                  () => this.focusCategory()
                ),
          error: () =>
            this.swall.error('Error', 'Failed to delete category!', () =>
              this.focusCategory()
            ),
        });
      });
  }

  resetCategory() {
    this.category = this.newCategory();
    this.duplicateError = false;
    this.focusCategory();
  }
}
