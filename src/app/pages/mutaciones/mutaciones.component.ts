import { Component } from '@angular/core';
import { GenericCrudComponent, CrudField } from '../../shared/generic-crud/generic-crud.component';

@Component({
  selector: 'app-mutaciones',
  standalone: true,
  imports: [GenericCrudComponent],
  template: `<app-generic-crud endpoint="mutaciones" title="Gestión de Mutaciones" [fields]="fields"></app-generic-crud>`
})
export class MutacionesComponent {
  fields: CrudField[] = [
    { key: 'id', label: 'ID', type: 'number', hideOnCreate: true },
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'multiplicador', label: 'Multiplicador', type: 'number' },
    { key: 'orden', label: 'Orden', type: 'number' }
  ];
}
