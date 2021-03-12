import { Injectable } from '@angular/core'
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { shareReplay, tap } from "rxjs/operators";
import jwtDecode from "jwt-decode"

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private baseUrl: string = "http://127.0.0.1:8000/";

  constructor(private client: HttpClient){}

  public login(user: string, password: string): Observable<any>{
    return this.client.post(
      this.baseUrl + "authentication/login/", {"username": user, "password": password}
    ).pipe(
      tap(response => this.setSession(response)),
      shareReplay(),
      tap(() => {
        this.client.get(this.baseUrl + "accounts/").subscribe( resp => console.log(resp));
      })
    );
  }

  private setSession(authResult: any) {
    const decodedToken = jwtDecode(authResult.access_token);
    console.log(decodedToken);
    localStorage.setItem('access_token', authResult.access_token);
    localStorage.setItem('refresh_token', authResult.refresh_token);
    localStorage.setItem('username', authResult.username);
  }
}
