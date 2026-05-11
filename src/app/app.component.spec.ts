import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { CaseStoreService } from './core/case-store.service';
import { CaseIoService } from './core/case-io.service';

describe('AppComponent — resetCase', () => {
  let dialog: jasmine.SpyObj<MatDialog>;
  let store: jasmine.SpyObj<CaseStoreService>;
  let caseIo: jasmine.SpyObj<CaseIoService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const setup = (confirmed: boolean | undefined) => {
    dialog.open.and.returnValue({ afterClosed: () => of(confirmed) } as any);
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    return { component: fixture.componentInstance, router };
  };

  beforeEach(async () => {
    dialog  = jasmine.createSpyObj('MatDialog', ['open']);
    store   = jasmine.createSpyObj('CaseStoreService', ['reset', 'loadCase'], { patient: () => null });
    caseIo  = jasmine.createSpyObj('CaseIoService', ['exportCase', 'importFile']);
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    })
      .overrideComponent(AppComponent, {
        set: {
          providers: [
            { provide: MatDialog,        useValue: dialog  },
            { provide: CaseStoreService, useValue: store   },
            { provide: CaseIoService,    useValue: caseIo  },
            { provide: MatSnackBar,      useValue: snackBar },
          ],
        },
      })
      .compileComponents();
  });

  it('abre el diálogo de confirmación antes de limpiar', () => {
    setup(false).component.resetCase();
    expect(dialog.open).toHaveBeenCalled();
  });

  it('limpia el caso y navega cuando el usuario confirma', () => {
    const { component, router } = setup(true);
    component.resetCase();
    expect(store.reset).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/medicaciones']);
  });

  it('no limpia el caso cuando el usuario cancela', () => {
    const { component, router } = setup(false);
    component.resetCase();
    expect(store.reset).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('no limpia el caso si el diálogo se cierra sin confirmar (undefined)', () => {
    const { component } = setup(undefined);
    component.resetCase();
    expect(store.reset).not.toHaveBeenCalled();
  });

  it('delega la exportación a CaseIoService al guardar', () => {
    const { component } = setup(false);
    component.onSave();
    expect(caseIo.exportCase).toHaveBeenCalled();
  });

  it('muestra confirmación y navega al cargar un fichero válido', async () => {
    caseIo.importFile.and.returnValue(Promise.resolve());
    const { component, router } = setup(false);

    const file = new File(['{}'], 'caso.json', { type: 'application/json' });
    const event = { target: { files: [file], value: '' } } as unknown as Event;

    await component.onLoad(event);

    expect(caseIo.importFile).toHaveBeenCalledWith(file);
    expect(snackBar.open).toHaveBeenCalledWith(
      jasmine.stringMatching(/cargado/i), jasmine.anything(), jasmine.anything()
    );
    expect(router.navigate).toHaveBeenCalledWith(['/medicaciones']);
  });

  it('muestra error en snackbar si el fichero es inválido', async () => {
    const errorMsg = 'Formato no válido: el archivo no contiene JSON válido.';
    caseIo.importFile.and.returnValue(Promise.reject(new Error(errorMsg)));
    const { component } = setup(false);

    const file = new File(['bad'], 'caso.json');
    const event = { target: { files: [file], value: '' } } as unknown as Event;

    await component.onLoad(event);

    expect(snackBar.open).toHaveBeenCalledWith(
      errorMsg, 'Cerrar', jasmine.anything()
    );
  });
});
