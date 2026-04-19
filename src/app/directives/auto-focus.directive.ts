import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
})
export class AutoFocusDirective implements AfterViewInit, OnChanges {
  @Input() delay = 0;
  @Input() appAutoFocus = false; // dynamic control

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    if (this.appAutoFocus) {
      this.focusElement();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appAutoFocus'] && changes['appAutoFocus'].currentValue) {
      this.focusElement();
    }
  }

  private focusElement() {
    setTimeout(() => {
      const element = this.el.nativeElement as HTMLElement;
      if (!element) return;
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
      ) {
        element.focus();
        element.select();
      } else {
        element.focus();
      }
    }, this.delay);
  }
}
