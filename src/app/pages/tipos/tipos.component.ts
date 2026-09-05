import { Component } from '@angular/core';
import { GenericCrudComponent, CrudField } from '../../shared/generic-crud/generic-crud.component';

@Component({
  selector: 'app-tipos',
  standalone: true,
  imports: [GenericCrudComponent],
  template: `<app-generic-crud endpoint="tipos" title="Gestión de Tipos" [fields]="fields"></app-generic-crud>`
})
export class TiposComponent {
  fields: CrudField[] = [
    { key: 'id', label: 'ID', type: 'number', hideOnCreate: true },
    { key: 'nombre', label: 'Nombre', type: 'text' }
  ];
}
