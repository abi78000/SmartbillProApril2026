import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from './icons.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,  
  ],
  exports: [
    CommonModule,
    FormsModule,
    IconsModule,   
  ]
})
export class SharedModule {}
