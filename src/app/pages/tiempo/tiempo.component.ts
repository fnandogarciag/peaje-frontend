import { Component } from '@angular/core';
import { GenericCrudComponent, CrudField } from '../../shared/generic-crud/generic-crud.component';

@Component({
  selector: 'app-tiempo',
  standalone: true,
  imports: [GenericCrudComponent],
  template: `<app-generic-crud endpoint="tiempo" title="Gestión de Tiempo" [fields]="fields"></app-generic-crud>`
})
export class TiempoComponent {
  fields: CrudField[] = [
    { key: 'id', label: 'ID', type: 'number', hideOnCreate: true },
    { key: 'idTipo', label: 'ID Tipo', type: 'number' },
    { key: 'idMutacion', label: 'ID Mutación', type: 'number' },
    { key: 'hora', label: 'Horas', type: 'number' },
    { key: 'minuto', label: 'Minutos', type: 'number' },
    { key: 'segundo', label: 'Segundos', type: 'number' },
  ];
}
