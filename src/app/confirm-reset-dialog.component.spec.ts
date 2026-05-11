import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { ConfirmResetDialogComponent } from './confirm-reset-dialog.component';

describe('ConfirmResetDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmResetDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmResetDialogComponent],
      providers: [{ provide: MatDialogRef, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmResetDialogComponent);
    fixture.detectChanges();
  });

  it('muestra un aviso de pérdida de datos', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Limpiar todo');
  });

  it('contiene un botón de confirmación', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const confirm = Array.from(buttons).find(b => b.textContent?.includes('Limpiar'));
    expect(confirm).toBeTruthy();
  });

  it('contiene un botón de cancelación', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const cancel = Array.from(buttons).find(b => b.textContent?.includes('Cancelar'));
    expect(cancel).toBeTruthy();
  });
});
