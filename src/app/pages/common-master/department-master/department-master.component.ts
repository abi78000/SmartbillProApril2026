import {
Component,
OnInit
} from '@angular/core';

import {
CommonModule
} from '@angular/common';

import {
FormsModule
} from '@angular/forms';

import {
DynamicTableComponent
} from '../../../framework/dynamic-table/dynamic-table.component';

import {
ReusableFormComponent
} from '../../../framework/reusable-form/reusable-form.component';

import {
CommonserviceService
} from '../../../services/commonservice.service';

import {
SweetAlertService
} from '../../../services/properties/sweet-alert.service';

@Component({

selector:'app-department-master',

standalone:true,

imports:[
CommonModule,
FormsModule,
DynamicTableComponent,
ReusableFormComponent
],

templateUrl:'./department-master.component.html',

styleUrls:[
'./department-master.component.css'
]

})

export class DepartmentMasterComponent
implements OnInit{


showForm=false;

isEditMode=false;

formTitle='New Department';

branches:any[]=[];

departments:any[]=[];

departmentModel:any={};



/* ===================================
   TABS
=================================== */

departmentTabs=[

'Details',
'Settings'

];


/* ===================================
   TABLE
=================================== */

departmentColumns=[

{
field:'departmentName',
header:'Department'
},

{
field:'branchName',
header:'Branch'
},

{
field:'isActive',
header:'Status'
}

];


/* ===================================
   FORM FIELDS
=================================== */

departmentFields=[

{
label:'Branch',
model:'branchID',
type:'select',
required:true,
tab:'Details',
optionLabel:'label',
optionValue:'value',
options:[]
},

{
label:'Department Name',
model:'departmentName',
type:'text',
required:true,
tab:'Details',
restrictType:'text',
autoFocus:true

},

{
label:'Department Code',
model:'departmentCode',
type:'text',
tab:'Details',
readonly:true
},

{
label:'Is Active',
model:'isActive',
type:'checkbox',
tab:'Settings'
}

];


constructor(

private commonservice:CommonserviceService,

private swal:SweetAlertService

){}


ngOnInit(){

this.resetModel();

this.loadBranches();

this.loadDepartments();

}



/* ===================================
   LOAD BRANCHES
=================================== */

loadBranches(){

this.commonservice
.getBranches()
.subscribe({

next:(res:any)=>{

this.branches=res;

const field=

this.departmentFields.find(

x=>x.model==='branchID'

);


if(field){

field.options=

res.map(

(branch:any)=>({

label:
branch.branchName,

value:
branch.branchID

})

);

}

},

error:(err)=>{

console.error(err);

}

});

}



/* ===================================
   LOAD DEPARTMENTS
=================================== */

loadDepartments(){

this.commonservice
.getDepartments()
.subscribe({

next:(res:any)=>{

this.departments=

res.map(

(dept:any)=>({

...dept,

branchName:
this.getBranchName(
dept.branchID
),

statusText:
dept.isActive
?
'Active'
:
'Inactive'

})

);

},

error:(err)=>{

console.error(err);

}

});

}



/* ===================================
   ADD
=================================== */

addDepartment(){

this.resetModel();

this.formTitle=
'New Department';

this.isEditMode=false;

this.showForm=true;

}



/* ===================================
   EDIT
=================================== */

editDepartment(row:any){

this.departmentModel={

departmentID:
row.departmentID,

branchID:
row.branchID,

departmentCode:
row.departmentCode,

departmentName:
row.departmentName,

isActive:
row.isActive,

createdByUserID:
row.createdByUserID,

createdSystemName:
row.createdSystemName,

createdAt:
row.createdAt,

updatedByUserID:
row.updatedByUserID,

updatedSystemName:
row.updatedSystemName,

updatedAt:
row.updatedAt

};

this.formTitle=
'Edit Department';

this.isEditMode=true;

this.showForm=true;

}



/* ===================================
   DUPLICATE CHECK
=================================== */
/* ===================================
   DUPLICATE CHECK
=================================== */

isDuplicate(

list:any[],

departmentName:string,

branchID:number,

idField='departmentID',

currentId:any=null

):boolean{


const normalize=

(text:any='')=>

String(text)

.trim()

.replace(/\s+/g,'')

.toLowerCase();


return list.some(

item =>

item[idField]
!==currentId

&&

Number(item.branchID)
===
Number(branchID)

&&

normalize(
item.departmentName
)

===

normalize(
departmentName
)

);

}



/* ===================================
   SAVE
=================================== */

saveDepartment(data:any){

data.departmentName=

data.departmentName
?.trim()
.replace(/\s+/g,' ');


/* REQUIRED */

if(!data.branchID){

return this.swal.warning(

'Validation',

'Select Branch'

);

}


if(!data.departmentName){

return this.swal.warning(

'Validation',

'Department Name Required'

);

}


/* DUPLICATE CHECK
   SAME BRANCH ONLY
*/

if(

this.isDuplicate(

this.departments,

data.departmentName,

data.branchID,

'departmentID',

data.departmentID

)

){

return this.swal.warning(

'Duplicate',

'Department already exists in this branch'

);

}


const now=

new Date()
.toISOString();


const payload={

departmentID:
Number(
data.departmentID
)||0,

branchID:
Number(
data.branchID
),

departmentCode:
data.departmentCode || '',

departmentName:
data.departmentName,

isActive:
Boolean(
data.isActive
),

createdByUserID:
data.createdByUserID || 0,

createdSystemName:
data.createdSystemName || 'AngularApp',

createdAt:
data.createdAt || now,

updatedByUserID:0,

updatedSystemName:'AngularApp',

updatedAt:now

};


console.log(
'Sending Payload:',
payload
);


this.commonservice
.saveDepartment(payload)
.subscribe({

next:()=>{

this.swal.success(

'Success',

this.isEditMode
?
'Department Updated'
:
'Department Created'

);

this.loadDepartments();

this.cancelForm();

},

error:(err)=>{

console.log(
'API Error:',
err.error
);

this.swal.error(

'Error',

'Save Failed'

);

}

});

}


/* ===================================
   DELETE
=================================== */

deleteDepartment(row:any){

row.isActive=false;

this.commonservice
.saveDepartment(row)
.subscribe({

next:()=>{

this.swal.success(

'Success',

'Deleted Successfully'

);

this.loadDepartments();

},

error:()=>{

this.swal.error(

'Error',

'Delete Failed'

);

}

});

}



/* ===================================
   REFRESH
=================================== */

refresh(){

this.cancelForm();

this.loadDepartments();

}



/* ===================================
   CANCEL
=================================== */

cancelForm(){

this.showForm=false;

this.resetModel();

}



/* ===================================
   RESET
=================================== */

resetModel(){

this.departmentModel={

departmentID:0,

branchID:null,

departmentCode:'',

departmentName:'',

isActive:true,

createdByUserID:0,

createdSystemName:'',

createdAt:'',

updatedByUserID:0,

updatedSystemName:'',

updatedAt:''

};

}



/* ===================================
   GET BRANCH NAME
=================================== */

getBranchName(
branchID:number
){

const branch=

this.branches.find(

x=>
x.branchID===branchID

);

return branch
?
branch.branchName
:
'';

}

}