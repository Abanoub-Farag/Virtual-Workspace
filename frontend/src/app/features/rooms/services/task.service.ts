import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

export interface TaskData {
  id: number;
  title: string;
  isCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskResponse {
  data: {
    content: TaskData[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/tasks`;

  private get authHeaders() {
    return { 'Authorization': `Bearer ${this.authService.getToken()}` };
  }

  getTasks(page: number = 0, size: number = 50, sort?: string): Observable<TaskResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    if (sort) {
      params = params.set('sort', sort);
    }

    return this.http.get<TaskResponse>(this.baseUrl, {
      headers: this.authHeaders,
      params
    });
  }

  createTask(data: { title: string; isCompleted: boolean }): Observable<any> {
    return this.http.post<any>(this.baseUrl, data, { headers: this.authHeaders });
  }

  updateTask(taskId: number, data: { title: string; isCompleted: boolean }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${taskId}`, data, { headers: this.authHeaders });
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${taskId}`, { headers: this.authHeaders });
  }
}
