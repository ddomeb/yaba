import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '//127.0.0.1:8000/';

  constructor(private client: HttpClient){}

  public getWithType<T>(endpoint: string): Observable<T>{
    const fullUrl: string = this.baseUrl + endpoint;
    return this.client.get<T>(fullUrl);
  }

  public get(endpoint: string): Observable<any>{
    const fullUrl: string = this.baseUrl + endpoint;
    return this.client.get(fullUrl);
  }

  public postWithType<T>(endpoint: string, body: any): Observable<T> {
    const fullUrl: string = this.baseUrl + endpoint;
    return this.client.post<T>(fullUrl, body);
  }

  public post(endpoint: string, body: any): Observable<any> {
    const fullUrl: string = this.baseUrl + endpoint;
    return this.client.post(fullUrl, body);
  }

  public putWithType<T>(endpoint: string, body: any): Observable<T> {
    const fullUrl: string = this.baseUrl + endpoint;
    return this.client.put<T>(fullUrl, body);
  }

  public put(endpoint: string, body: any): Observable<any> {
    const fullUrl: string = this.baseUrl + endpoint;
    return this.client.put(fullUrl, body);
  }

  public deleteWithType<T = any>(endpoint: string): Observable<T>{
    const fullUrl: string = this.baseUrl + endpoint;
    return this.client.delete<T>(fullUrl);
  }

  public delete(endpoint: string): Observable<any>{
    const fullUrl: string = this.baseUrl + endpoint;
    return this.client.delete(fullUrl);
  }
}
