import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/** --- Interfaces matching backend C# models --- */
export interface RequisitionForm {
  rfId: string;
  rsNumber?: string;
  rfNumber?: string;
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
  workflowStatus: string; // From the [NotMapped] property
  selected?: boolean; // For UI checkbox state
}

export interface RequisitionArchive {
  archiveId: string;
  rfId: string;
  rsNumber?: string;
  rfNumber?: string;
  requesterName?: string;
  department?: string;
  purpose?: string;
  dateRequested?: string;
  archivedAt: string;
  archivedReason?: string;
  archivedBy?: string;
  finalWorkflowStatus: string;
}

/** --- Request/Response bodies for backend APIs --- */
export interface ArchiveRequest {
  reason?: string;
  archivedBy?: string;
}

export interface BulkArchiveRequest {
  ids: string[];
  reason?: string;
  archivedBy?: string;
}

export interface ApiSuccessResponse {
  message: string;
  detail?: string;
}

export interface SearchParams {
    department?: string;
    requesterName?: string;
    status?: string;
    rsNumber?: string;
    rfNumber?: string;
}


@Injectable({
  providedIn: 'root'
})
export class RequisitionsService {
  // --- FIX ---
  // The base URL was pointing to the Angular development server's address.
  // It needs to point to your .NET backend API, including the port and controller name.
  // Your Swagger screenshots show the backend is on port 5265 and the controller route is /api/Requisition.
  // While this is hardcoded here for the fix, the best practice is to put this URL 
  // in your environment.ts file (e.g., environment.apiUrl).
  private readonly API_BASE_URL = 'http://192.168.1.7:5265/api/Requisition';

  constructor(private readonly http: HttpClient) {}

  /** --- Active Requisitions --- */
  getAll(): Observable<RequisitionForm[]> {
    // This will now correctly call http://192.168.1.7:5265/api/Requisition
    return this.http.get<RequisitionForm[]>(this.API_BASE_URL);
  }

  getById(id: string): Observable<RequisitionForm> {
    return this.http.get<RequisitionForm>(`${this.API_BASE_URL}/${id}`);
  }

  create(form: Partial<RequisitionForm>): Observable<RequisitionForm> {
    return this.http.post<RequisitionForm>(this.API_BASE_URL, form);
  }

  update(id: string, form: Partial<RequisitionForm>): Observable<RequisitionForm> {
    return this.http.put<RequisitionForm>(`${this.API_BASE_URL}/${id}`, form);
  }
  
  /** --- Soft Delete (Archive) --- */
  delete(id: string, reason: string = 'Archived via Angular', archivedBy: string = 'system'): Observable<ApiSuccessResponse> {
    const body: ArchiveRequest = { reason, archivedBy };
    return this.http.request<ApiSuccessResponse>('delete', `${this.API_BASE_URL}/${id}`, { body });
  }
  
  deleteBulk(ids: string[], reason: string = 'Bulk archive', archivedBy: string = 'system'): Observable<ApiSuccessResponse> {
    const body: BulkArchiveRequest = { ids, reason, archivedBy };
    return this.http.request<ApiSuccessResponse>('delete', `${this.API_BASE_URL}/bulk`, { body });
  }

  /** --- Search Active Requisitions --- */
  search(params: SearchParams): Observable<RequisitionForm[]> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            httpParams = httpParams.set(key, value);
        }
    });
    return this.http.get<RequisitionForm[]>(`${this.API_BASE_URL}/search`, { params: httpParams });
  }

  /** --- Archived Requisitions --- */
  getAllArchived(): Observable<RequisitionArchive[]> {
    return this.http.get<RequisitionArchive[]>(`${this.API_BASE_URL}/archive`);
  }

  hardDeleteArchived(id: string): Observable<ApiSuccessResponse> {
    return this.http.delete<ApiSuccessResponse>(`${this.API_BASE_URL}/archive/${id}`);
  }
}
