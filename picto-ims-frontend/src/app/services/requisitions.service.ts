import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Requisition {
  rfId: string;
  requesterName: string;
  requesterPosition: string;
  department: string;
  purpose: string;
  dateRequested?: string;
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
  isArchived: boolean;
  selected?: boolean;
}

export interface CreateRequisitionRequest {
  rfId: string;
  requesterName: string;
  requesterPosition: string;
  department: string;
  purpose: string;
  dateRequested?: string;
  checkedByName?: string;
  approvedByName?: string;
  issuedByName?: string;
  receivedByName?: string;
  isArchived: boolean;
}

export interface UpdateRequisitionRequest extends CreateRequisitionRequest {
  rfId: string;
}

@Injectable({
  providedIn: 'root'
})
export class RequisitionsService {
  private readonly API_BASE_URL = 'http://localhost:5265/api/Requisition';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Requisition[]> {
    return this.http.get<Requisition[]>(this.API_BASE_URL);
  }

  create(req: Requisition): Observable<Requisition> {
    return this.http.post<Requisition>(this.API_BASE_URL, req);
  }

  getById(id: string): Observable<Requisition> {
    return this.http.get<Requisition>(`${this.API_BASE_URL}/${id}`);
  }

  update(id: string, req: Requisition): Observable<Requisition> {
    return this.http.put<Requisition>(`${this.API_BASE_URL}/${id}`, req);
  }

  /**
   * Delete one or many requisitions.
   * If a string is passed → single delete with reason + archivedBy.
   * If an array is passed → bulk delete with list of ids.
   */
  delete(
    ids: string | string[],
    reason: string = 'Archived via Angular',
    archivedBy: string = 'system'
  ): Observable<any> {
    if (Array.isArray(ids)) {
      // Bulk delete
      return this.http.delete(`${this.API_BASE_URL}/bulk`, { body: ids });
    } else {
      // Single delete
      return this.http.request('delete', `${this.API_BASE_URL}/${ids}`, {
        body: { reason, archivedBy }
      });
    }
  }

  search(term: string): Observable<Requisition[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<Requisition[]>(`${this.API_BASE_URL}/search`, { params });
  }
  deleteBulk(ids: string[]): Observable<any> {
  return this.http.delete(`${this.API_BASE_URL}/bulk`, { body: ids });
  }

}