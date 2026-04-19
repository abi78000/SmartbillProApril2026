import { Directive, HostListener, Input, ElementRef } from '@angular/core';

@Directive({
  selector: '[appInputRestrict]',
})
export class InputRestrictDirective {
  constructor(private el: ElementRef) {}

  @Input('appInputRestrict') type:
    | 'number'
    | 'letter'
    | 'text'
    | 'email'
    | 'address'
    | 'uppercase'
    | 'password' = 'text';

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {

    const allowedKeys = [
      'Backspace',
      'Tab',
      ' ',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Enter',
      'Home',
      'End'
    ];

    if (allowedKeys.includes(event.key)) return;

    const key = event.key;

    switch (this.type) {

      case 'number':
        if (!/^\d$/.test(key)) event.preventDefault();
        break;

      case 'letter':
        if (!/^[a-zA-Z]$/.test(key)) event.preventDefault();
        break;

      case 'uppercase':
        if (!/^[a-zA-Z]$/.test(key)) event.preventDefault();
        break;

      case 'text':
        if (!/^[a-zA-Z0-9.]$/.test(key)) event.preventDefault();
        break;

      case 'email':
        if (!/^[a-zA-Z0-9@._+-]$/.test(key)) event.preventDefault();
        break;

      case 'address':
        if (!/^[a-zA-Z0-9\s,.\-#/]$/.test(key)) event.preventDefault();
        break;

      case 'password':
        if (!/^[a-zA-Z0-9@]$/.test(key)) event.preventDefault();
        break;
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: any) {

    if (this.type === 'uppercase') {
      event.target.value = event.target.value.toUpperCase();
    }

  }
}