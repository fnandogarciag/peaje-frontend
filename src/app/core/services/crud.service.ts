import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  private http = inject(HttpClient);

  getAll(endpoint: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:5000/api/${endpoint}`);
  }

  createOrUpdate(endpoint: string, data: any): Observable<any> {
    return this.http.post<any>(`http://localhost:5000/api/${endpoint}`, data);
  }
}
