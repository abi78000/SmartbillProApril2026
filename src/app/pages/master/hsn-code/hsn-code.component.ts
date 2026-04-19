import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../../../services/master.service';
import { ValidationService } from '../../../services/properties/validation.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { FocusOnKeyDirective } from '../../../directives/focus-on-key.directive';
import { Observable, share } from 'rxjs';

import { HSN, Tax } from '../../models/common-models/master-models/master';
import { SharedModule } from '../../../shared/shared.module';
import { MasterTableViewComponent } from '../../components/master-table-view/master-table-view.component';
interface ApiResponse {
  success: boolean;
  message?: string;
}

@Component({
  selector: 'app-hsn-code',
  standalone: true,
  imports: [FormsModule, CommonModule, SharedModule, MasterTableViewComponent],
  templateUrl: './hsn-code.component.html',
  styleUrls: ['./hsn-code.component.css'],
})
export class HsnCodeComponent {
  hsnColumns = [
    { field: 'hsnCode', header: 'HSN Code' },
    { field: 'description', header: 'Description' },
    { field: 'taxName', header: 'Tax Name' },
    { field: 'isActive', header: 'Active' },
  ];
  isEditMode = false;
  isFormEnabled = false;
  hsns: HSN[] = [];
  hsn: HSN = this.newHSN();
  taxes: Tax[] = [];
  private currentUserId: number;

  constructor(
    private readonly masterService: MasterService,
    private readonly swall: SweetAlertService
  ) {
    this.currentUserId = Number(localStorage.getItem('userId')) || 0;
  }

  ngOnInit() {
    this.loadHSNCodes();
    this.loadTaxes();
    this.isFormEnabled = false;
  }
  newHSNCreate() {
    this.resetHSN();
    this.isEditMode = false;
    this.isFormEnabled = true;
  }
  refreshHSN() {
    this.resetHSN();
    this.isEditMode = false;
    this.isFormEnabled = false;
  }
  private newHSN(): HSN {
    const now = new Date().toISOString();
    return {
      hsnid: 0,
      hsnCode: '',
      description: '',
      taxID: 0,
      isActive: true,
      createdByUserID: this.currentUserId,
      createdSystemName: 'AngularApp',
      createdAt: now,
      updatedByUserID: this.currentUserId,
      updatedSystemName: 'AngularApp',
      updatedAt: now,
    };
  }

  private focusHSN() {
    setTimeout(() => {
      const el = document.getElementById('hsnCode') as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 0);
  }

  loadHSNCodes() {
    this.masterService.getHSNCodes().subscribe({
      next: (res) => (this.hsns = res ?? []),
      error: () =>
        this.swall.error('Error', 'Failed to load HSN names!', () =>
          this.focusHSN()
        ),
    });
  }

  loadTaxes() {
    this.masterService.getTaxes().subscribe({
      next: (res) => (this.taxes = res ?? []),
      error: () => this.swall.error('Error', 'Failed to load Taxes!'),
    });
  }

  private validateHSN(): boolean {
    this.hsn.hsnCode = this.hsn.hsnCode?.trim() || '';
    this.hsn.description = this.hsn.description?.trim() || '';
    if (!this.hsn.hsnCode) {
      this.swall.warning('Validation', 'HSN Code is required!', () =>
        this.focusHSN()
      );
      return false;
    }
    if (!this.hsn.description) {
      this.swall.warning('Validation', 'HSN Name is required!', () =>
        this.focusHSN()
      );
      return false;
    }
    if (!this.hsn.taxID || this.hsn.taxID === 0) {
      this.swall.warning('Validation', 'Select a Tax!', () => this.focusHSN());
      return false;
    }
    return true;
  }

  saveOrUpdateHSN() {
    if (!this.validateHSN()) return;

    const now = new Date().toISOString();
    const payload: HSN = {
      ...this.hsn,
      createdByUserID: this.hsn.hsnid
        ? this.hsn.createdByUserID
        : this.currentUserId,
      updatedByUserID: this.currentUserId,
      createdAt: this.hsn.createdAt || now,
      updatedAt: now,
      createdSystemName: 'AngularApp',
      updatedSystemName: 'AngularApp',
    };

    this.masterService.saveHSNCode(payload).subscribe({
      next: (res: ApiResponse) => {
        if (res.success) {
          this.loadHSNCodes();
          this.resetHSN();
          this.swall.success(
            'Success',
            res.message || 'HSN saved successfully!',
            () => this.focusHSN()
          );
        } else {
          this.swall.error(
            'Error',
            res.message || 'Something went wrong!',
            () => this.focusHSN()
          );
        }
      },
      error: () =>
        this.swall.error('Error', 'Failed to save HSN!', () => this.focusHSN()),
    });
  }

  editHSN(h: HSN) {
    this.hsn = { ...h };
    this.focusHSN();
  }

  deleteHSN(h: HSN) {
    this.swall
      .confirm(
        `Delete "${h.description}"?`,
        'This will mark the HSN as inactive.'
      )
      .then((result) => {
        if (!result.isConfirmed) return;
        const deleted: HSN = {
          ...h,
          isActive: false,
          updatedByUserID: this.currentUserId,
          updatedAt: new Date().toISOString(),
        };
        this.masterService.saveHSNCode(deleted).subscribe({
          next: (res: ApiResponse) =>
            res.success
              ? (this.loadHSNCodes(),
                this.swall.success(
                  'Deleted!',
                  res.message || 'HSN deleted!',
                  () => this.focusHSN()
                ))
              : this.swall.error(
                  'Error',
                  res.message || 'Failed to delete HSN!',
                  () => this.focusHSN()
                ),
          error: () =>
            this.swall.error('Error', 'Failed to delete HSN!', () =>
              this.focusHSN()
            ),
        });
      });
  }

  resetHSN() {
    this.hsn = this.newHSN();
    this.focusHSN();
  }
  getTaxName(taxID: number): string {
    const tax = this.taxes.find((t) => t.taxID === taxID);
    return tax ? tax.taxName : '-';
  }
}
