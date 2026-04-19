import { Component, NgModule } from '@angular/core';
import { CommonserviceService } from '../../services/commonservice.service';
import { Role } from '../models/common-models/companyMaster';
import { User, UserPermission, Module } from '../models/common-models/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-authentication',
  imports: [CommonModule, FormsModule],
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css'],
})
export class AuthenticationComponent {
  clearAllSelections() {
    throw new Error('Method not implemented.');
  }
  roles: Role[] = [];
  users: User[] = [];
  permissions: UserPermission[] = [];
  modules: Module[] = [];
  selectAll: boolean = false;
  // Track selected modules separately
  selectedModulesMap: { [moduleID: number]: boolean } = {};
  permissionNameMap: { [moduleID: number]: string } = {};

  selectedRoleId: number | undefined;
  selectedUserId: number | undefined;

  constructor(private service: CommonserviceService) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
    this.loadModules();
  }
  toggleSelectAll() {
    Object.keys(this.selectedModulesMap).forEach((key) => {
      this.selectedModulesMap[+key] = this.selectAll;
    });
  }
  loadRoles() {
    this.service.getRoles().subscribe((res) => (this.roles = res));
  }

  loadUsers() {
    this.service.getUsers().subscribe((res) => (this.users = res));
  }

  loadPermissionsForRole() {
    if (!this.selectedRoleId) return;
    this.service.getPermissionsByRole(this.selectedRoleId).subscribe((res) => {
      this.permissions = res;
      this.markSelectedModules();
    });
  }

  loadPermissionsForUser() {
    if (!this.selectedUserId) return;
    this.service.getPermissionsByUser(this.selectedUserId).subscribe((res) => {
      this.permissions = res;
      this.markSelectedModules();
    });
  }

  loadModules() {
    this.service.getAllModules().subscribe(
      (res) => {
        this.modules = res;
        res.forEach((m) => {
          if (!(m.moduleID in this.selectedModulesMap))
            this.selectedModulesMap[m.moduleID] = false;
          if (!(m.moduleID in this.permissionNameMap))
            this.permissionNameMap[m.moduleID] = '';
        });
        this.markSelectedModules();
      },
      (err) => console.error('Failed to load modules', err),
    );
  }

  savePermission(permission: UserPermission) {
    if (!permission.permissionName || !permission.moduleID) {
      alert('Permission Name is required for each module.');
      return;
    }
    this.service.savePermission(permission).subscribe(() => {});
  }

  deletePermission(id: number) {
    if (!confirm('Are you sure to delete this permission?')) return;
    this.service.deletePermission(id).subscribe(() => {
      if (this.selectedUserId) this.loadPermissionsForUser();
      else if (this.selectedRoleId) this.loadPermissionsForRole();
    });
  }

  saveAllSelectedModules() {
    if (!this.selectedUserId) {
      alert('Please select a user first.');
      return;
    }

    const selectedModuleIDs = Object.keys(this.selectedModulesMap)
      .filter((id) => this.selectedModulesMap[+id])
      .map((id) => +id);

    if (!selectedModuleIDs.length) {
      alert('Please select at least one module.');
      return;
    }

    const existingPermission = this.permissions.find(
      (p) => p.userID === this.selectedUserId,
    );

    const permission: UserPermission = {
      id: existingPermission ? existingPermission.id : 0, // important for update
      userID: this.selectedUserId,
      roleID: 0,
      moduleID: selectedModuleIDs.join(','),
      permissionName: '',
    };

    this.service.savePermission(permission).subscribe(() => {
      if (existingPermission) {
        alert('Modules updated successfully for this user.');
      } else {
        alert('Modules saved successfully for this user.');
      }

      this.loadPermissionsForUser(); // refresh checkboxes
    });
  }

  onUserChange() {
    if (this.selectedUserId) {
      this.loadPermissionsForUser(); // fetches the row for that user
    } else {
      // Clear selections
      Object.keys(this.selectedModulesMap).forEach(
        (k) => (this.selectedModulesMap[+k] = false),
      );
      this.permissions = [];
    }
  }

  private markSelectedModules() {
    Object.keys(this.selectedModulesMap).forEach(
      (k) => (this.selectedModulesMap[+k] = false),
    );

    this.permissions.forEach((p) => {
      if (!p.moduleID) return;

      let moduleIds: number[] = [];
      if (typeof p.moduleID === 'string')
        moduleIds = p.moduleID.split(',').map((id) => +id);
      else if (typeof p.moduleID === 'number') moduleIds = [p.moduleID];
      else if (
        Array.isArray(p.moduleID) &&
        Array.isArray(p.moduleID) &&
        (p.moduleID as Array<number | string>).every(
          (id) => typeof id === 'number' || typeof id === 'string',
        )
      ) {
        moduleIds = (p.moduleID as Array<number | string>).map((id) => +id);
      }

      moduleIds.forEach((id) => (this.selectedModulesMap[id] = true));
    });
  }
}
