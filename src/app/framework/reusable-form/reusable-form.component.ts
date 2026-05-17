import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  InputRestrictDirective
} from '../../directives/input-restrict.directive';

import {
  FocusOnKeyDirective
} from '../../directives/focus-on-key.directive';

@Component({

  selector:'app-reusable-form',

  standalone:true,

  imports:[

    CommonModule,
    FormsModule,
    FocusOnKeyDirective,
    InputRestrictDirective

  ],

  templateUrl:
  './reusable-form.component.html',

  styleUrls:[
    './reusable-form.component.css'
  ]

})

export class ReusableFormComponent
implements OnInit{


  /* ==========================================
     TITLE
  ========================================== */

  @Input()
  title='Form';


  /* ==========================================
     TABS
  ========================================== */

  @Input()
  tabs:any[]=[];


  /* ==========================================
     ACTIVE TAB
  ========================================== */

  activeTab='';


  /* ==========================================
     FIELDS
  ========================================== */

  @Input()
  fields:any[]=[];


  /* ==========================================
     MODEL
  ========================================== */

  @Input()
  model:any={};


  /* ==========================================
     SAVE EVENT
  ========================================== */

  @Output()
  saveForm=
  new EventEmitter<any>();


  /* ==========================================
     CANCEL EVENT
  ========================================== */

  @Output()
  cancelForm=
  new EventEmitter();


  /* ==========================================
     FIELD CHANGE EVENT
  ========================================== */

  @Output()
  fieldChange=
  new EventEmitter<any>();


  /* ==========================================
     INIT
  ========================================== */

  ngOnInit():void{

    if(
      this.tabs &&
      this.tabs.length>0
    ){

      this.activeTab=
      this.tabs[0];

    }

  }


  /* ==========================================
     TAB CHANGE
  ========================================== */

  changeTab(
    tab:string
  ){

    this.activeTab=
    tab;

  }


  /* ==========================================
     GET TAB FIELDS
  ========================================== */

  getTabFields(){

    return this.fields.filter(

      field=>

      field.tab===

      this.activeTab

    );

  }


  /* ==========================================
     FIELD VALUE CHANGED
  ========================================== */

  onFieldValueChange(

    field:string,

    value:any

  ){

    this.fieldChange.emit({

      field:field,

      value:value

    });

  }


  /* ==========================================
     SAVE
  ========================================== */

  save(){

    this.saveForm.emit(

      this.model

    );

  }


  /* ==========================================
     CANCEL
  ========================================== */

  cancel(){

    this.cancelForm.emit();

  }


  /* ==========================================
     TRACK BY
  ========================================== */

  trackByField(

    index:number,

    field:any

  ){

    return field.model;

  }

}