import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RequisitionForm {
  rfId: string;
  requesterName: string;
  requesterPosition?: string;
  department?: string;
  purpose?: string;
  dateRequested: string;
  checkedByName?: string;
  checkedByPosition?: string;
  checkedByDate?: string;
  approvedByName?: string;
  approvedByPosition?: string;
  approvedByDate?: string;
  issuedByName?: string;
  issuedByPosition?: string;
  issuedByDate?: string;
  receivedByName?: string;
  receivedByPosition?: string;
  receivedByDate?: string;
  isArchived?: boolean;
}

export interface RequisitionArchive {
  rfId: string;
  requesterName: string;
  department?: string;
  purpose?: string;
  dateRequested: string;
  archivedBy?: string;
  archivedDate?: string;
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RequisitionService {
  private apiUrl = '/api/requisitions'; // adjust to your API base

  constructor(private http: HttpClient) {}

  /** --- Active Requisitions --- */
  getAll(): Observable<RequisitionForm[]> {
    return this.http.get<RequisitionForm[]>(`${this.apiUrl}`);
  }

  getById(id: string): Observable<RequisitionForm> {
    return this.http.get<RequisitionForm>(`${this.apiUrl}/${id}`);
  }

  create(form: RequisitionForm): Observable<RequisitionForm> {
    return this.http.post<RequisitionForm>(`${this.apiUrl}`, form);
  }

  update(id: string, form: RequisitionForm): Observable<boolean> {
    return this.http.put<boolean>(`${this.apiUrl}/${id}`, form);
  }

  softDelete(id: string, reason: string = 'Archived via API', archivedBy: string = 'system'): Observable<boolean> {
    return this.http.patch<boolean>(`${this.apiUrl}/soft-delete/${id}`, { reason, archivedBy });
  }

  softDeleteBulk(ids: string[], reason: string = 'Bulk delete', archivedBy: string = 'system'): Observable<number> {
    return this.http.patch<number>(`${this.apiUrl}/soft-delete-bulk`, { ids, reason, archivedBy });
  }

  hardDelete(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/hard-delete/${id}`);
  }

  /** --- Archived Requisitions --- */
  getAllArchived(): Observable<RequisitionArchive[]> {
    return this.http.get<RequisitionArchive[]>(`${this.apiUrl}/archive`);
  }

  getArchivedById(id: string): Observable<RequisitionArchive> {
    return this.http.get<RequisitionArchive>(`${this.apiUrl}/archive/${id}`);
  }

  hardDeleteArchived(ids: string[] | string): Observable<boolean> {
    if (Array.isArray(ids)) {
      return this.http.request<boolean>('delete', `${this.apiUrl}/archive`, { body: { ids } });
    }
    return this.http.delete<boolean>(`${this.apiUrl}/archive/${ids}`);
  }
}