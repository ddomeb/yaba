import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '//127.0.0.1:8000/';

  constructor(private readonly client: HttpClient){}

  public get<T = any>(endpoint: string, headers?: HttpHeaders, params?: HttpParams): Observable<T>{
    const fullUrl: string = this.baseUrl + endpoint;
    return this.client.get<T>(fullUrl, {headers, params});
  }

  public post<T = any>(endpoint: string, body: any): Observable<T> {
    const fullUrl: string = this.baseUrl + endpoint;
    return this.client.post<T>(fullUrl, body);
  }

  public put<T = any>(endpoint: string, body: any): Observable<T> {
    const fullUrl: string = this.baseUrl + endpoint;
    return this.client.put<T>(fullUrl, body);
  }

  public delete<T = any>(endpoint: string): Observable<T>{
    const fullUrl: string = this.baseUrl + endpoint;
    return this.client.delete<T>(fullUrl);
  }
}
