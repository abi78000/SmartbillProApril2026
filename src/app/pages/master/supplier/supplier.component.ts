import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../../../services/master.service';
import { ValidationService } from '../../../services/properties/validation.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { FocusOnKeyDirective } from '../../../directives/focus-on-key.directive';
import { InputRestrictDirective } from '../../../directives/input-restrict.directive';
import { CommonserviceService } from '../../../services/commonservice.service';
import { Observable } from 'rxjs';
import { Supplier } from '../../models/common-models/master-models/master';
import { SharedModule } from '../../../shared/shared.module';
import { MasterTableViewComponent } from '../../components/master-table-view/master-table-view.component';

interface ApiResponse 
{ success: boolean; message?: string; }
@Component({
  selector: 'app-supplier',
    standalone: true,
  imports: [FormsModule, CommonModule,SharedModule,MasterTableViewComponent, FocusOnKeyDirective],
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.css'
})
export class SupplierComponent {
  suppliers: Supplier[] = [];
  supplier!: Supplier;
  duplicateError = false;

    supplierColumns = [
    { field: 'supplierName', header: 'Supplier Name' },
    { field: 'isActive', header: 'Active' },
  ];
  isEditMode = false;
  isFormEnabled = false;

  constructor(
    private readonly masterService: MasterService,
    private readonly validationService: ValidationService,
    private readonly commonService: CommonserviceService,
    private readonly swall: SweetAlertService
  ) {}

  ngOnInit() {
    this.resetSupplier();
    this.loadSuppliers();
    this.isFormEnabled = false;
  }
    newSupplierCreate() {
    this.resetSupplier();
    this.isEditMode = false;
    this.isFormEnabled = true;
  }
  refreshSuppliers() {
    this.resetSupplier();
    this.isEditMode = false;
    this.isFormEnabled = false;
  }

  private newSupplier(): Supplier {
    const now = new Date().toISOString();
    return {
      supplierID: 0,
      supplierCode: '',
      supplierName: '',
      phone: '',
      alternatePhone: '',
      email: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      gstNumber: '',
      isActive: true,
      createdByUserID: this.commonService.getCurrentUserId(),
      createdSystemName: 'AngularApp',
      createdAt: now,
      updatedByUserID: this.commonService.getCurrentUserId(),
      updatedSystemName: 'AngularApp',
      updatedAt: now
    };
  }

  private focusSupplier(targetId: string = 'supplierName') {
    setTimeout(() => {
      const el = document.getElementById(targetId) as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 0);
  }

  loadSuppliers() {
    this.masterService.getSuppliers().subscribe({
      next: res => this.suppliers = res ?? [],
      error: () => this.swall.error('Error', 'Failed to load suppliers!', () => this.focusSupplier())
    });
  }

checkDuplicate() {
  const name = this.supplier.supplierName?.trim().toLowerCase() || '';
  this.duplicateError = this.suppliers.some(s =>
    s.supplierID !== this.supplier.supplierID && // ignore the current supplier when editing
    s.supplierName?.trim().toLowerCase() === name
  );
}

  private validateSupplier(): boolean {
    this.supplier.supplierName = this.supplier.supplierName?.trim() || '';
    this.checkDuplicate();

    if (!this.supplier.supplierName) {
      this.swall.warning('Validation', 'Supplier Name is required!', () => this.focusSupplier('supplierName'));
      return false;
    }

    if (this.duplicateError) {
      this.swall.warning('Validation', 'Supplier Name already exists!', () => this.focusSupplier('supplierName'));
      return false;
    }

    return true;
  }

  saveOrUpdateSupplier() {
    if (!this.validateSupplier()) return;

    const now = new Date().toISOString();
    if (this.supplier.supplierID && this.supplier.supplierID > 0) {
      this.supplier.updatedByUserID = this.commonService.getCurrentUserId();
      this.supplier.updatedSystemName = 'AngularApp';
      this.supplier.updatedAt = now;
    } else {
      this.supplier.createdByUserID = this.commonService.getCurrentUserId();
      this.supplier.createdSystemName = 'AngularApp';
      this.supplier.createdAt = now;
      this.supplier.updatedByUserID = this.commonService.getCurrentUserId();
      this.supplier.updatedSystemName = 'AngularApp';
      this.supplier.updatedAt = now;
    }

    this.masterService.saveSupplier(this.supplier).subscribe({
      next: (res: ApiResponse) => {
        if (res.success) {
          this.loadSuppliers();
          this.resetSupplier();
          this.swall.success('Success', res.message || 'Supplier saved successfully!', () => this.focusSupplier());
        } else {
          this.swall.error('Error', res.message || 'Something went wrong!', () => this.focusSupplier());
        }
      },
      error: () => this.swall.error('Error', 'Failed to save supplier!', () => this.focusSupplier())
    });
  }

  editSupplier(s: Supplier) {
    this.supplier = { ...s };
    this.focusSupplier();
  }

  deleteSupplier(s: Supplier) {
    this.swall.confirm(`Delete ${s.supplierName}?`, 'This will mark the supplier as inactive.').then(result => {
      if (!result.isConfirmed) return;

      const deleted: Supplier = {
        ...s,
        isActive: false,
        updatedByUserID: this.commonService.getCurrentUserId(),
        updatedSystemName: 'AngularApp',
        updatedAt: new Date().toISOString()
      };

      this.masterService.saveSupplier(deleted).subscribe({
        next: (res: ApiResponse) => {
          if (res.success) {
            this.loadSuppliers();
            this.swall.success('Deleted!', res.message || 'Supplier deleted!', () => this.focusSupplier());
          } else {
            this.swall.error('Error', res.message || 'Failed to delete supplier!', () => this.focusSupplier());
          }
        },
        error: () => this.swall.error('Error', 'Failed to delete supplier!', () => this.focusSupplier())
      });
    });
  }

  resetSupplier() {
    this.supplier = this.newSupplier();
    this.duplicateError = false;
    this.focusSupplier();
  }
}
