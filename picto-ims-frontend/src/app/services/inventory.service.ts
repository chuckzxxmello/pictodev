import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryItem, CreateInventoryRequest, UpdateInventoryRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly API_BASE_URL = 'https://localhost:5001/api';

  constructor(private http: HttpClient) {}

  getAllInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.API_BASE_URL}/inventory`);
  }

  getInventoryById(id: number): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.API_BASE_URL}/inventory/${id}`);
  }

  createInventory(item: CreateInventoryRequest): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.API_BASE_URL}/inventory`, item);
  }

  updateInventory(id: number, item: UpdateInventoryRequest): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.API_BASE_URL}/inventory/${id}`, item);
  }

  deleteInventory(id: number): Observable<any> {
    return this.http.delete(`${this.API_BASE_URL}/inventory/${id}`);
  }

  searchInventory(searchTerm: string): Observable<InventoryItem[]> {
    const params = new HttpParams().set('term', searchTerm);
    return this.http.get<InventoryItem[]>(`${this.API_BASE_URL}/inventory/search`, { params });
  }

  getLowStockItems(threshold: number = 5): Observable<InventoryItem[]> {
    const params = new HttpParams().set('threshold', threshold.toString());
    return this.http.get<InventoryItem[]>(`${this.API_BASE_URL}/inventory/low-stock`, { params });
  }

  exportToExcel(): Observable<Blob> {
    return this.http.get(`${this.API_BASE_URL}/inventory/export`, { 
      responseType: 'blob' 
    });
  }

  importFromExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.API_BASE_URL}/inventory/import`, formData);
  }
}