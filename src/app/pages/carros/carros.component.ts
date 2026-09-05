import { Component } from '@angular/core';
import { GenericCrudComponent, CrudField } from '../../shared/generic-crud/generic-crud.component';

@Component({
  selector: 'app-carros',
  standalone: true,
  imports: [GenericCrudComponent],
  template: `<app-generic-crud endpoint="carros" title="Gestión de Carros" [fields]="fields"></app-generic-crud>`
})
export class CarrosComponent {
  fields: CrudField[] = [
    { key: 'id', label: 'ID', type: 'number', hideOnCreate: true },
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'idTipo', label: 'ID Tipo', type: 'number' },
    { key: 'precio', label: 'Precio', type: 'number' },
    { key: 'activo', label: 'Activo', type: 'boolean', defaultValue: true }
  ];
}
