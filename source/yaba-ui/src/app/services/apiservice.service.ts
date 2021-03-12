import { Injectable } from '@angular/core'
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string = "//127.0.0.1:8000/";

  constructor(private client: HttpClient){}

  public getWithType<T>(endpoint: string): Observable<T>{
    let fullUrl: string = this.baseUrl + endpoint;
    return this.client.get(fullUrl) as Observable<T>;
  }

  public get(endpoint: string): Observable<any>{
    let fullUrl: string = this.baseUrl + endpoint;
    return this.client.get(fullUrl);
  }
}
