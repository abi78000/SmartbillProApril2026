import {Component,OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DynamicTableComponent} from '../../../framework/dynamic-table/dynamic-table.component';
import {ReusableFormComponent} from '../../../framework/reusable-form/reusable-form.component';
import {CommonserviceService} from '../../../services/commonservice.service';
import {SweetAlertService} from '../../../services/properties/sweet-alert.service';

@Component({
selector:'app-company-master',
standalone:true,
imports:[
CommonModule,
DynamicTableComponent,
ReusableFormComponent
],
templateUrl:'./company-master.component.html',
styleUrls:['./company-master.component.css']
})

export class CompanyMasterComponent implements OnInit{

showForm=false;
isEditMode=false;
formTitle='New Company';

selectedLogoFile:File|null=null;
selectedImageFile:File|null=null;

companies:any[]=[];
companyModel:any={};

companyTabs=[
'Details',
'Address',
'Tax',
'Bank',
'Attachments',
'Settings'
];

companyColumns=[
{field:'companyName',header:'Company'},
{field:'phone',header:'Phone'},
{field:'email',header:'Email'},
{field:'city',header:'City'},
{field:'country',header:'Country'},
{field:'isActive',header:'Status'}
];

companyFields=[

{label:'Company Name',model:'companyName',type:'text',required:true,tab:'Details',restrictType:'text',autoFocus:true},
{label:'Phone',model:'phone',type:'text',tab:'Details',restrictType:'number'},
{label:'Alternate Phone',model:'alternatePhone',type:'text',tab:'Details',restrictType:'number'},
{label:'Email',model:'email',type:'email',tab:'Details',restrictType:'email'},
{label:'Website',model:'website',type:'text',tab:'Details'},

{label:'Address Line 1',model:'addressLine1',type:'text',tab:'Address',columnSpan:2},
{label:'Address Line 2',model:'addressLine2',type:'text',tab:'Address',columnSpan:2},
{label:'City',model:'city',type:'text',tab:'Address',restrictType:'letter'},
{label:'State',model:'state',type:'text',tab:'Address',restrictType:'letter'},
{label:'Country',model:'country',type:'text',tab:'Address',restrictType:'letter'},
{label:'Pincode',model:'pincode',type:'text',tab:'Address',restrictType:'number'},

{label:'GST Number',model:'gstNumber',type:'text',tab:'Tax'},
{label:'PAN Number',model:'panNumber',type:'text',tab:'Tax'},
{label:'CIN Number',model:'cinNumber',type:'text',tab:'Tax'},

{label:'Bank Name',model:'bankName',type:'text',tab:'Bank'},
{label:'Account Number',model:'bankAccountNumber',type:'text',tab:'Bank'},
{label:'IFSC Code',model:'ifscCode',type:'text',tab:'Bank'},

{label:'Company Logo',model:'companyLogo',type:'file',tab:'Attachments'},
{label:'Company Image',model:'companyImage',type:'file',tab:'Attachments'},

{label:'Is Active',model:'isActive',type:'checkbox',tab:'Settings'}

];

constructor(
private commonservice:CommonserviceService,
private swal:SweetAlertService
){}

ngOnInit(){
this.resetModel();
this.loadCompanies();
}

get totalCompanies(){
return this.companies.length;
}

loadCompanies(){

this.commonservice
.getCompanies()
.subscribe({

next:(res:any)=>{
this.companies=res;
},

error:(err)=>{
console.error(err);
}

});

}

addCompany(){

this.resetModel();

this.formTitle='New Company';

this.isEditMode=false;

this.showForm=true;

}

editCompany(row:any){

this.companyModel={...row};

this.formTitle='Edit Company';

this.isEditMode=true;

this.showForm=true;

}
/* ==========================================
   REUSABLE DUPLICATE CHECK
========================================== */

isDuplicate(
list:any[],
field:string,
value:string,
idField:string='id',
currentId:any=null
):boolean{

const normalize=(text:string='')=>

text

.trim()

.replace(/\s+/g,'')

.replace(/[-_]/g,'')

.toLowerCase();


const inputValue=

normalize(value);


return list.some(

item=>{

const existing=

normalize(
item[field]
);

return(

item[idField]
!==currentId

&&

existing===inputValue

);

});

}
async saveCompany(data:any){

/* CLEAN VALUE */

data.companyName=
data.companyName
?.trim()
.replace(/\s+/g,' ');


/* REQUIRED */

if(!data.companyName){

return this.swal.warning(
'Validation',
'Company Name Required'
);

}


/* DUPLICATE CHECK */

if(

this.isDuplicate(

this.companies,

'companyName',

data.companyName,

'companyID',

data.companyID

)

){

return this.swal.warning(

'Duplicate',

'Company Name Already Exists'

);

}


/* EMAIL */

if(

data.email &&

!/^[^\s@]+@[^\s@]+\.[^\s@]+$/
.test(data.email)

){

return this.swal.warning(

'Validation',

'Invalid Email'

);

}


/* FILES */

if(this.selectedLogoFile){

data.companyLogo=

await this.fileToByteArray(
this.selectedLogoFile
);

}


if(this.selectedImageFile){

data.companyImage=

await this.fileToByteArray(
this.selectedImageFile
);

}


/* SAVE API */

this.commonservice
.saveCompany(data)
.subscribe({

next:()=>{

this.swal.success(

'Success',

this.isEditMode
? 'Company Updated'
: 'Company Created'

);

this.loadCompanies();

this.cancelForm();

},

error:(err)=>{

console.error(err);

this.swal.error(
'Error',
'Save Failed'
);

}

});

}

deleteCompany(row:any){

row.isActive=false;

this.commonservice
.saveCompany(row)
.subscribe({

next:()=>{

this.swal.success(
'Success',
'Deleted Successfully'
);

this.loadCompanies();

},

error:()=>{

this.swal.error(
'Error',
'Delete Failed'
);

}

});

}

refresh(){

this.loadCompanies();

}

cancelForm(){

this.showForm=false;

this.resetModel();

}

resetModel(){

this.companyModel={

companyID:0,
companyCode:'',
companyName:'',
phone:'',
alternatePhone:'',
email:'',
website:'',
addressLine1:'',
addressLine2:'',
addressLine3:'',
addressLine4:'',
city:'',
state:'',
country:'',
pincode:'',
gstNumber:'',
panNumber:'',
cinNumber:'',
bankName:'',
bankAccountNumber:'',
ifscCode:'',
companyLogo:null,
companyImage:null,
isActive:true

};

}

onFileSelected(
event:any,
type:'logo'|'image'
){

const file=
event.target.files[0];

if(!file)return;

if(type==='logo')
this.selectedLogoFile=file;

else
this.selectedImageFile=file;

}

private fileToByteArray(
file:File
):Promise<number[]>{

return new Promise(
(resolve,reject)=>{

const reader=
new FileReader();

reader.onload=
(e:any)=>{

const base64=
e.target.result
.split(',')[1];

resolve(

Array.from(
atob(base64),
c=>c.charCodeAt(0)
)

);

};

reader.onerror=
reject;

reader.readAsDataURL(file);

});

}

}