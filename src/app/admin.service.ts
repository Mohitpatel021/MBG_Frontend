import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../environments/environment.dev';
import { ShareServiceService } from './share-service.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService {

  private API_URL = environment.apiUrl;
  constructor(private sharedService: ShareServiceService, private http: HttpClient) { }

  generateRandomUUID(): string {
    return uuidv4();  // Generates a random UUID
  }

  getAllUsersForAdmin(
    pageNumber: number,
    elementSizeInPage: number,
    token: string,
    username: string,
    searchParam: string
  ): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    if (searchParam && searchParam.trim() !== '') {
      return this.http.get<any>(`${this.API_URL}/dashboard/admin?username=${username}&pageNumber=${pageNumber.toString()}&PageSize=${elementSizeInPage.toString()}&searchParam=${searchParam}`, {
        headers,
      });
    } else {
      return this.http.get<any>(`${this.API_URL}/dashboard/admin?username=${username}&pageNumber=${pageNumber.toString()}&PageSize=${elementSizeInPage.toString()}`, {
        headers,
      });
    }
  }

  accountEnableAndDisableOperation(username: string, adminUsername: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<any>(`${this.API_URL}/login/toggle-enable?username=${username}&admin=${adminUsername}`, {}, { headers });
  }

  getAllUserCount(username: string): Observable<any> {
    const token = this.sharedService.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    const params = new HttpParams().set('username', username);
    return this.http.get<any>(`${this.API_URL}/dashboard/admin/total/client`, {
      params, headers
    });
  }
  downloadExcel(username: string, token: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.ms-excel',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.API_URL}/dashboard/admin/create/excel?username=${username}`, { headers, responseType: 'blob' });
  }

  recentReviews(username: string, clientId: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.API_URL}/dashboard/user/recent-review?username=${username}&clientId=${clientId}`, { headers });
  }

  lastMonthReview(username: string, clientId: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.API_URL}/dashboard/user/last-month/count?username=${username}&clientId=${clientId}`, { headers });
  }

  recentClientsForAdmin(username: string, token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.API_URL}/dashboard/admin/recent/client?username=${username}`, { headers });
  }

  deleteAllTheUserInformation(username: string, token: string, clientId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.API_URL}/login/delete?username=${username}&clientId=${clientId}`, { headers });
  }

  updateUserDetails(username: string, token: string, updateData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.API_URL}/login/update/user?username=${username}`, updateData, { headers });
  }
}
