import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../../../services/master.service';
import { ValidationService } from '../../../services/properties/validation.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { FocusOnKeyDirective } from '../../../directives/focus-on-key.directive';
import { CommonserviceService } from '../../../services/commonservice.service';
import { Tax } from '../../models/common-models/master-models/master';
import { MasterTableViewComponent } from '../../components/master-table-view/master-table-view.component';
import { SharedModule } from '../../../shared/shared.module';
interface ApiResponse {
  success: boolean;
  message?: string;
}

@Component({
  selector: 'app-tax',
  imports: [
    CommonModule,
    FormsModule,
    FocusOnKeyDirective,
    MasterTableViewComponent,
    SharedModule,
  ],
  templateUrl: './tax.component.html',
  styleUrl: './tax.component.css',
})
export class TaxComponent {
  taxes: Tax[] = [];
  tax: Tax = this.newTax();

  duplicateError = false;
  taxColumns = [
    { field: 'taxName', header: 'Tax Name' },
    { field: 'taxRate', header: 'Tax Rate (%)' },
    { field: 'cessRate', header: 'Cess Rate (%)' },
    { field: 'isActive', header: 'Active' },
  ];
  isEditMode = false;
  isFormEnabled = false;

  constructor(
    private readonly masterService: MasterService,
    private readonly commonService: CommonserviceService,
    private readonly validationService: ValidationService,
    private readonly swall: SweetAlertService
  ) {}

  ngOnInit() {
    this.loadTaxes();
  }

   newTaxCreate() {
    this.refreshTaxes();
    this.isEditMode = false;
    this.isFormEnabled = true;
  }
  refreshTaxes() {
    this.loadTaxes();
    this.isEditMode = false;
    this.isFormEnabled = false;
  }
  private newTax(): Tax {
    const now = new Date().toISOString();
    return {
      taxID: 0,
      taxName: '',
      taxRate: 0,
      cessRate: 0,
      isActive: true,
      createdByUserID: 0,
      createdSystemName: 'AngularApp',
      createdAt: now,
      updatedByUserID: 0,
      updatedSystemName: 'AngularApp',
      updatedAt: now,
    };
  }

  /** Focus on tax name input */
  private focusTax() {
    setTimeout(() => {
      const el = document.getElementById('taxName') as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 0);
  }

  /** Load all taxes */
  loadTaxes() {
    this.masterService.getTaxes().subscribe({
      next: (res) => (this.taxes = res ?? []),
      error: () =>
        this.swall.error('Error', 'Failed to load taxes!', () =>
          this.focusTax()
        ),
    });
  }

  /** Check duplicate tax name */
  checkDuplicate() {
    this.duplicateError = this.taxes
      .filter((t) => t.taxID !== this.tax.taxID) // ignore current record
      .some(
        (t) =>
          t.taxName.trim().toLowerCase() ===
          this.tax.taxName.trim().toLowerCase()
      );
  }

  /** Validate before save/update */
  private validateTax(): boolean {
    this.tax.taxName = this.tax.taxName?.trim() || '';
    this.checkDuplicate();
    if (!this.tax.taxName) {
      this.swall.warning('Validation', 'Tax Name is required!', () =>
        this.focusTax()
      );
      return false;
    }
    if (this.duplicateError) {
      this.swall.warning('Validation', 'Tax already exists!', () =>
        this.focusTax()
      );
      return false;
    }
    return true;
  }

  /** Save or update tax */
  saveOrUpdateTax() {
    if (!this.validateTax()) return;

    const userId = this.commonService.getCurrentUserId();
    const now = new Date().toISOString();

    if (this.tax.taxID === 0) {
      this.tax.createdByUserID = userId;
      this.tax.createdAt = now;
      this.tax.createdSystemName = 'AngularApp';
    }

    this.tax.updatedByUserID = userId;
    this.tax.updatedAt = now;
    this.tax.updatedSystemName = 'AngularApp';

    this.masterService.saveTax(this.tax).subscribe({
      next: (res: ApiResponse) => {
        if (res.success) {
          this.loadTaxes();
          this.resetTax();
          this.swall.success(
            'Success',
            res.message || 'Tax saved successfully!',
            () => this.focusTax()
          );
        } else {
          this.swall.error(
            'Error',
            res.message || 'Something went wrong!',
            () => this.focusTax()
          );
        }
      },
      error: () =>
        this.swall.error('Error', 'Failed to save tax!', () => this.focusTax()),
    });
  }

  /** Edit tax */
  editTax(t: Tax) {
    this.tax = { ...t };
    this.focusTax();
  }

  /** Delete (mark inactive) tax */
  deleteTax(t: Tax) {
    this.swall
      .confirm(`Delete ${t.taxName}?`, 'This will mark the tax as inactive.')
      .then((result) => {
        if (!result.isConfirmed) return;

        const userId = this.commonService.getCurrentUserId();
        const now = new Date().toISOString();

        const deleted: Tax = {
          ...t,
          isActive: false,
          updatedByUserID: userId,
          updatedAt: now,
          updatedSystemName: 'AngularApp',
        };

        this.masterService.saveTax(deleted).subscribe({
          next: (res: ApiResponse) =>
            res.success
              ? (this.loadTaxes(),
                this.swall.success(
                  'Deleted!',
                  res.message || 'Tax deleted!',
                  () => this.focusTax()
                ))
              : this.swall.error(
                  'Error',
                  res.message || 'Failed to delete tax!',
                  () => this.focusTax()
                ),
          error: () =>
            this.swall.error('Error', 'Failed to delete tax!', () =>
              this.focusTax()
            ),
        });
      });
  }

  /** Reset form */
  resetTax() {
    this.tax = this.newTax();
    this.duplicateError = false;
    this.focusTax();
  }
}
