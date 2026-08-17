import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SupabaseService } from './supabase.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="min-h-[calc(100vh-128px)] bg-stone-100 px-4 py-12 sm:px-6 lg:py-20">
      <div class="mx-auto max-w-md">
        <div class="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9">
          <p class="text-xs font-black tracking-[0.22em] text-amber-700">QUẢN TRỊ</p>
          <h1 class="mt-3 text-3xl font-black tracking-tight text-stone-950">
            Đăng nhập
          </h1>
          <p class="mt-2 text-sm leading-6 text-stone-500">
            Đăng nhập tài khoản quản trị để quản lý sản phẩm.
          </p>

          <form class="mt-8 space-y-4" (ngSubmit)="login()">
            <label class="block">
              <span class="mb-2 block text-sm font-bold text-stone-700">Email</span>
              <input
                [(ngModel)]="email"
                name="email"
                type="email"
                autocomplete="username"
                required
                class="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                placeholder="admin@example.com"
              />
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-bold text-stone-700">Mật khẩu</span>
              <input
                [(ngModel)]="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-700"
                placeholder="••••••••"
              />
            </label>

            <button
              [disabled]="loading"
              class="w-full rounded-2xl bg-stone-900 px-4 py-3.5 font-black text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
            </button>

            <p *ngIf="error" class="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              {{ error }}
            </p>
          </form>
        </div>
      </div>
    </section>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private readonly service: SupabaseService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async login(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const result = await this.service.login(this.email.trim(), this.password);

      if (result.error) {
        this.error = 'Email hoặc mật khẩu không đúng.';
        return;
      }

      await this.router.navigateByUrl('/admin');
    } catch (error) {
      console.error('[HainhuShop] Login error:', error);
      this.error = 'Không thể đăng nhập. Vui lòng thử lại.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
