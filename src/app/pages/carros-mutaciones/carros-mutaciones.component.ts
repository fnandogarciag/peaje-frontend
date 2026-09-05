import { Component } from '@angular/core';
import { GenericCrudComponent, CrudField } from '../../shared/generic-crud/generic-crud.component';

@Component({
  selector: 'app-carros-mutaciones',
  standalone: true,
  imports: [GenericCrudComponent],
  template: `<app-generic-crud endpoint="carros-mutaciones" title="Gestión de Carros Mutaciones" [fields]="fields"></app-generic-crud>`
})
export class CarrosMutacionesComponent {
  fields: CrudField[] = [
    { key: 'id', label: 'ID', type: 'number', hideOnCreate: true },
    { key: 'idCarro', label: 'ID Carro', type: 'number' },
    { key: 'idMutacion', label: 'ID Mutación', type: 'number' },
    { key: 'inventario', label: 'Inventario', type: 'number' },
    { key: 'usando', label: 'Usando', type: 'number' }
  ];
}
