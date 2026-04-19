import { Directive, HostListener, Input, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appFocusOnKey]',
  standalone: true
})
export class FocusOnKeyDirective implements AfterViewInit {
  @Input('appFocusOnKey') targetId?: string;
  @Input() autoSelectNext: boolean = false;
  @Input() autoFocus: boolean = false;
  @Input() delay: number = 0;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    if (this.autoFocus) {
      setTimeout(() => this.focusElement(this.el.nativeElement), this.delay);
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {

    const current = this.el.nativeElement;

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.handleEnterKey(current);
        break
      case 'ArrowRight':
        event.preventDefault();
        this.focusNext(current);
        break;

      case 'ArrowLeft':
           event.preventDefault();
        this.focusPrev(current);
        break;
    }
  }

  private handleEnterKey(current: HTMLElement) {
    let target: HTMLElement | null = null;

    if (this.targetId) {
      target = document.getElementById(this.targetId);
    } else {
      target = this.getNextFocusable(current);
    }

    if (target) this.focusElement(target);
  }

  // --------------------------
  // ARROW DOWN → next focusable
  // --------------------------
  private focusNext(current: HTMLElement) {
    const next = this.getNextFocusable(current);
    if (next) this.focusElement(next);
  }

  // --------------------------
  // ARROW UP → previous focusable
  // --------------------------
  private focusPrev(current: HTMLElement) {
    const list = this.getFocusableElements();
    const index = list.indexOf(current);
    if (index > 0) this.focusElement(list[index - 1]);
  }

  // --------------------------
  // FOCUS HELPER
  // --------------------------
  private focusElement(element: HTMLElement) {
    element.focus();
    if (this.autoSelectNext && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
      if (!element.readOnly) element.select();
    }
  }

  // --------------------------
  // ALL FOCUSABLE ELEMENTS
  // --------------------------
  private getFocusableElements(): HTMLElement[] {
    return Array.from(
      document.querySelectorAll<HTMLElement>(
        `
        input:not([disabled]):not([type=hidden]),
        select:not([disabled]),
        textarea:not([disabled]),
        button:not([disabled])
        `
      )
    );
  }

  private getNextFocusable(current: HTMLElement): HTMLElement | null {
    const list = this.getFocusableElements();
    const index = list.indexOf(current);
    if (index >= 0 && index < list.length - 1) return list[index + 1];
    return null;
  }
}
