import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { ApiResponse,CreateInventoryRequest, UpdateInventoryRequest, PaginatedResponse } from '../models/index';
import { environment } from '../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';

export interface PictoInventory {
  itemId: number;
  itemName: string;
  serialNumber: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  status: string;
  dateAdded: string;
  selected?: boolean;
}

export interface InventoryFilters {
  search?: string;
  category?: string;
  status?: string;
  location?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreatePictoInventoryRequest {
  item_name: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  status: string;
  serial_number?: string;
}

export interface UpdatePictoInventoryRequest extends CreatePictoInventoryRequest {
  item_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly API_BASE_URL = 'http://localhost:5265/api';
  constructor(private http: HttpClient) {}

  /** Soft delete a single inventory item */
  softDeleteInventory(id: number): Observable<any> {
    return this.http.delete(`${this.API_BASE_URL}/inventory/${id}/soft`);
  }

  softDeleteInventoryBulk(ids: number[]): Observable<any> {
  return this.http.post(`${this.API_BASE_URL}/inventory/bulk-soft-delete`, ids);
  }

  getAllInventory(): Observable<PictoInventory[]> {
    return this.http.get<PictoInventory[]>(`${this.API_BASE_URL}/inventory`);
  }

  getInventoryById(id: number): Observable<PictoInventory> {
    return this.http.get<PictoInventory>(`${this.API_BASE_URL}/inventory/${id}`);
  }

  createInventory(item: CreateInventoryRequest): Observable<PictoInventory> {
    return this.http.post<PictoInventory>(`${this.API_BASE_URL}/inventory`, item);
  }

  updateInventory(id: number, item: UpdateInventoryRequest): Observable<PictoInventory> {
    return this.http.put<PictoInventory>(`${this.API_BASE_URL}/inventory/${id}`, item);
  }

  deleteInventory(id: number): Observable<any> {
    return this.http.delete(`${this.API_BASE_URL}/inventory/${id}`);
  }

  searchInventory(searchTerm: string): Observable<PictoInventory[]> {
    const params = new HttpParams().set('term', searchTerm);
    return this.http.get<PictoInventory[]>(`${this.API_BASE_URL}/inventory/search`, { params });
  }

  getLowStockItems(threshold: number = 5): Observable<PictoInventory[]> {
    const params = new HttpParams().set('threshold', threshold.toString());
    return this.http.get<PictoInventory[]>(`${this.API_BASE_URL}/inventory/low-stock`, { params });
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
  getAllArchived(): Observable<PictoInventory[]> {
    return this.http.get<PictoInventory[]>(`${this.API_BASE_URL}/inventory/archived`);
  }

  hardDeleteArchived(ids: number[]): Observable<any> {
    // Replace the URL and logic with your actual API endpoint for hard delete
    return this.http.post('/api/inventory/archive/hard-delete', { ids });
  }
}