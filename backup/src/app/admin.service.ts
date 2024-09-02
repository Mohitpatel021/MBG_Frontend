import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private API_URL = 'https://reviewus.in';
  // private API_URL = 'http://localhost:9090';

  constructor(private cookies: CookieService, private http: HttpClient) {}

  getAllUsersForAdmin(
    pageNumber: number,
    elementSizeInPage: number
  ): Observable<any> {
    const token = this.cookies.get('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', elementSizeInPage.toString());

    return this.http.get<any>(`${this.API_URL}/dashboard/admin`, {
      headers,
      params,
    });
  }

  getAllUserCount(username: string): Observable<any> {
    const token = this.cookies.get('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams().set('username', username);
    return this.http.get<any>(`${this.API_URL}/dashboard/admin/total/client`, {
      headers,
      params,
    });
  }
}
