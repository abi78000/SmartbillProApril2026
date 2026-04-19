import { Component } from '@angular/core';
import {
  Company,
  Branch,
  Department,
  Role,
} from '../../models/common-models/companyMaster';
import { CommonserviceService } from '../../../services/commonservice.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { MasterTableViewComponent } from '../../components/master-table-view/master-table-view.component';
import { SharedModule } from '../../../shared/shared.module';
MasterTableViewComponent;

@Component({
  selector: 'app-role-master',
  imports: [CommonModule, FormsModule, SharedModule, MasterTableViewComponent],
  templateUrl: './role-master.component.html',
  styleUrls: ['./role-master.component.css'],
})
export class RoleMasterComponent {
  roleColumns = [
    { field: 'roleName', header: 'ROLE Name' },
    { field: 'isActive', header: 'Active' },
  ];
  isEditMode = false;
  isFormEnabled = false;

  roles: Role[] = [];
  role: Role = this.getEmptyRole();

  constructor(
    private commonservice: CommonserviceService,
    private swallservice: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.isFormEnabled = false;
  }

  newRole() {
    this.resetForm();
    this.isEditMode = false;
    this.isFormEnabled = true;
  }
  refreshRoles() {
    this.resetForm();
    this.isEditMode = false;
    this.isFormEnabled = false;
  }
  getEmptyRole(): Role {
    return {
      roleID: 0,
      roleCode: '',
      roleName: '',
      isActive: true,
      createdByUserID: 0,
      createdSystemName: '',
      createdAt: new Date().toISOString(),
      updatedByUserID: 0,
      updatedSystemName: '',
      updatedAt: new Date().toISOString(),
    };
  }

  loadRoles() {
    this.commonservice.getRoles().subscribe({
      next: (res) => (this.roles = res),
      error: (err) => {
        console.error(' Error loading roles:', err);
        this.swallservice.error('Error', 'Could not load role list.');
      },
    });
  }

  saveOrUpdateRole() {
    if (!this.role.roleName) {
      this.swallservice.error('Error', 'Role Name and Code are required!');
      return;
    }

    this.commonservice.saveRole(this.role).subscribe({
      next: (id) => {
        this.swallservice.success(
          'Success',
          `Role ${this.role.roleID > 0 ? 'updated' : 'created'} successfully!`
        );
        this.loadRoles();
        this.resetForm();
      },
      error: (err) => {
        console.error(' Error saving role:', err);
        this.swallservice.error('Error', 'Could not save role.');
      },
    });
  }

  editRole(r: Role) {
    this.role = { ...r }; // fill form for editing
  }

  deleteRole(r: Role) {
    if (!confirm(`Are you sure you want to delete ${r.roleName}?`)) {
      return;
    }

    r.isActive = false; // soft delete
    this.commonservice.saveRole(r).subscribe({
      next: (id) => {
        console.log('Role deleted (soft delete), ID:', id);
        this.swallservice.success('Success', 'Role deleted successfully!');
        this.loadRoles();
      },
      error: (err) => {
        console.error(' Error deleting role:', err);
        this.swallservice.error('Error', 'Could not delete role.');
      },
    });
  }

  resetForm() {
    this.role = this.getEmptyRole();
  }
}
