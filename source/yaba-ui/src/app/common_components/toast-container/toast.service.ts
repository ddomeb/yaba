import { Injectable, TemplateRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: any[] = [];

  showStandard(msg: string): void {
    this.show(msg);
  }

  showSuccess(msg: string): void {
    this.show(msg, { classname: 'bg-success text-light', delay: 10000 });
  }

  showDanger(msg: string): void {
    this.show(msg, { classname: 'bg-danger text-light', delay: 15000 });
  }

  show(textOrTpl: string | TemplateRef<any>, options: any = {}): void {
    this.toasts.push({ textOrTpl, ...options });
  }

  remove(toast: any): void {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
