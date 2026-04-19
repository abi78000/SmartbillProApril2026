export interface User {
  userID: number;
  companyID: number;
  branchID: number;
  departmentID: number;
  roleID: number;
  userName: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: Date;
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: Date;
}
export interface UserPermission {
  id: number;
  userID?: number;
  moduleID: string;
  roleID?: number;
  permissionName: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface Module {
  moduleID: number;
  label: string;                 // required now
  route: string | null;          // allow null
  icon: string | null;
  isActive: boolean;
  parentID: number | null;
  children: Module[];
}
