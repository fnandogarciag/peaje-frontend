import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService } from '../../core/services/crud.service';

export interface CrudField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean';
  hideOnCreate?: boolean;
  defaultValue?: any;
}

@Component({
  selector: 'app-generic-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generic-crud.component.html',
  styleUrl: './generic-crud.component.css'
})
export class GenericCrudComponent implements OnInit {
  @Input({ required: true }) endpoint!: string;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) fields!: CrudField[];
  
  private crudService = inject(CrudService);
  
  data = signal<any[]>([]);
  isModalOpen = signal(false);
  formData = signal<any>({});
  
  ngOnInit() {
    this.loadData();
  }
  
  loadData() {
    this.crudService.getAll(this.endpoint).subscribe({
      next: (res) => {
        this.data.set(res || []);
      },
      error: (err) => console.error(err)
    });
  }
  
  openModal(item?: any) {
    if (item) {
      this.formData.set({ ...item });
    } else {
      const emptyForm: any = {};
      this.fields.forEach(field => {
        if (!field.hideOnCreate) {
           if (field.defaultValue !== undefined) {
             emptyForm[field.key] = field.defaultValue;
           } else {
             emptyForm[field.key] = field.type === 'boolean' ? false : (field.type === 'number' ? 0 : '');
           }
        }
      });
      this.formData.set(emptyForm);
    }
    this.isModalOpen.set(true);

    setTimeout(() => {
      const isEdit = !!item;
      const firstField = this.fields.find(f => !f.hideOnCreate || isEdit);
      if (firstField) {
        document.getElementById('field-' + firstField.key)?.focus();
      }
    }, 50);
  }
  
  closeModal() {
    this.isModalOpen.set(false);
    this.formData.set({});
  }
  
  save() {
    this.crudService.createOrUpdate(this.endpoint, this.formData()).subscribe({
      next: () => {
        this.loadData();
        this.closeModal();
      },
      error: (err) => console.error(err)
    });
  }
}

