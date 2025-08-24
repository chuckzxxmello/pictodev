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
  stockThreshold: number;
  selected?: boolean;
}

export interface InventoryArchive {
  archiveId: number;
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
  archivedAt: string;
  archivedReason: string;
  archivedBy: string;
  stockThreshold: number;
  originalItemId?: number; // Added this to match your DB schema
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
  itemName: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  status: string;
  serialNumber?: string;
  stockThreshold: number;
}

export interface UpdatePictoInventoryRequest {
  itemId: number;
  itemName: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  status: string;
  serialNumber?: string;
  stockThreshold: number;
}

// New interface for soft delete requests
export interface SoftDeleteRequest {
  reason?: string;
  deletedBy?: string;
}

export interface BulkSoftDeleteRequest {
  itemIds: number[];
  reason?: string;
  deletedBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly API_BASE_URL = environment.apiUrl;
  
  constructor(private http: HttpClient) {}

  /** Get all inventory items */
  getAllInventory(): Observable<PictoInventory[]> {
    console.log('API URL:', this.API_BASE_URL);

    return this.http.get<PictoInventory[]>(`${this.API_BASE_URL}/inventory`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /** Get inventory item by ID */
  getInventoryById(id: number): Observable<PictoInventory> {
    return this.http.get<PictoInventory>(`${this.API_BASE_URL}/inventory/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /** Create new inventory item */
  createInventory(item: CreatePictoInventoryRequest): Observable<PictoInventory> {
    return this.http.post<PictoInventory>(`${this.API_BASE_URL}/inventory`, item)
      .pipe(
        catchError(this.handleError)
      );
  }

  /** Update existing inventory item */
  updateInventory(id: number, item: UpdatePictoInventoryRequest): Observable<PictoInventory> {
    return this.http.put<PictoInventory>(`${this.API_BASE_URL}/inventory/${id}`, item)
      .pipe(
        catchError(this.handleError)
      );
  }

  /** Soft delete a single inventory item - moves to archive with user tracking */
  softDeleteInventory(id: number, reason?: string, deletedBy?: string): Observable<any> {
    let params = new HttpParams();
    
    if (reason) {
      params = params.set('reason', reason);
    }
    if (deletedBy) {
      params = params.set('deletedBy', deletedBy);
    }
    
    return this.http.delete(`${this.API_BASE_URL}/inventory/${id}/soft`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /** Alternative method using request body for soft delete */
  softDeleteInventoryWithBody(id: number, request: SoftDeleteRequest): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/inventory/${id}/soft-delete`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /** Soft delete multiple inventory items - moves to archive with user tracking */
  softDeleteInventoryBulk(ids: number[], reason?: string, deletedBy?: string): Observable<any> {
    const request: BulkSoftDeleteRequest = {
      itemIds: ids,
      reason: reason || 'Bulk deletion',
      deletedBy: deletedBy
    };
    
    return this.http.post(`${this.API_BASE_URL}/inventory/bulk-soft-delete`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /** Hard delete from archive (permanent deletion) - Uses archive ID */
  deleteInventory(archiveId: number): Observable<any> {
    console.log('Deleting archived inventory item with archive ID:', archiveId);
    return this.http.delete(`${this.API_BASE_URL}/inventory/archive/${archiveId}`)
      .pipe(
        tap(response => console.log('Delete response:', response)),
        catchError(this.handleError)
      );
  }

  /** Get all archived items */
  getAllArchived(): Observable<InventoryArchive[]> {
    return this.http.get<InventoryArchive[]>(`${this.API_BASE_URL}/inventory/archive`)
      .pipe(
        tap(data => console.log('Archived inventory data:', data)),
        catchError(this.handleError)
      );
  }

  /** Get archived item by archive ID */
  getArchivedById(archiveId: number): Observable<InventoryArchive> {
    return this.http.get<InventoryArchive>(`${this.API_BASE_URL}/inventory/archive/${archiveId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /** Search inventory items */
  searchInventory(searchTerm: string): Observable<PictoInventory[]> {
    const params = new HttpParams().set('term', searchTerm);
    return this.http.get<PictoInventory[]>(`${this.API_BASE_URL}/inventory/search`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /** Get items with low stock */
  getLowStockItems(threshold: number = 5): Observable<PictoInventory[]> {
    const params = new HttpParams().set('threshold', threshold.toString());
    return this.http.get<PictoInventory[]>(`${this.API_BASE_URL}/inventory/low-stock`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /** Get consumption analytics for dashboard */
  getConsumptionAnalytics(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE_URL}/inventory/analytics/consumption`)
      .pipe(
        tap(data => console.log('Analytics data received:', data)),
        catchError(this.handleError)
      );
  }

  /** Export inventory to Excel */
  exportToExcel(): Observable<Blob> {
    return this.http.get(`${this.API_BASE_URL}/inventory/export`, { 
      responseType: 'blob' 
    }).pipe(
      catchError(this.handleError)
    );
  }

  /** Import inventory from Excel */
  importFromExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.API_BASE_URL}/inventory/import`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /** Hard delete multiple archived items - Uses archive IDs */
  hardDeleteArchived(archiveIds: number[]): Observable<any> {
    console.log('Bulk deleting archived items with archive IDs:', archiveIds);
    return this.http.post(`${this.API_BASE_URL}/inventory/archive/hard-delete`, { ids: archiveIds })
      .pipe(
        tap(response => console.log('Bulk delete response:', response)),
        catchError(this.handleError)
      );
  }

  /** Hard delete single archived item by archive ID */
  hardDeleteSingleArchived(archiveId: number): Observable<any> {
    console.log('Deleting single archived item with archive ID:', archiveId);
    return this.http.delete(`${this.API_BASE_URL}/inventory/archive/${archiveId}`)
      .pipe(
        tap(response => console.log('Single delete response:', response)),
        catchError(this.handleError)
      );
  }

  /** Error handler */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (error.status === 403) {
        errorMessage = 'Access denied. You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.error?.message || `Server returned code: ${error.status}`;
      }
    }
    
    console.error('HTTP Error:', error);
    console.error('Error message:', errorMessage);
    
    return throwError(() => new Error(errorMessage));
  }
}