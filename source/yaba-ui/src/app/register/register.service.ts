import { Injectable } from '@angular/core';
import {ApiService} from '../services/apiservice.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(private readonly apiService: ApiService) { }

  public sendRegistration(username: string, password: string, email: string): Observable<any> {
    return this.apiService.post(
      'registration/',
      {username, password1: password, password2: password, email}
    );
  }

}
