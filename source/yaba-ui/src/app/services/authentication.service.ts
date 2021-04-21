import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {catchError, finalize, shareReplay, switchMap, tap} from 'rxjs/operators';
// import jwtDecode, { JwtPayload } from 'jwt-decode';
import {SessionInfo, refreshTokenTokenIsExpired} from '../common_models/sessioninfo.interface';

interface TokenInfo {
  exp: number;
  jti: string;
  token_type: string;
  user_id: number;
}

interface AuthenticationResponse {
  access_token: string;
  refresh_token: string;
  user: {
    pk: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface RefreshResponse {
  access: string;
  access_token_expiration: number;
}

const SESSION_INFO_KEY = 'session_info';

const LOGIN_URL = 'authentication/login/';
const LOGOUT_URL = 'authentication/logout/';
const REFRESH_URL = 'authentication/token/refresh/';
const VERIFY_URL = 'authentication/token/verify/';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private baseUrl = 'http://127.0.0.1:8000/';
  // @ts-ignore
  private isLoggedIn: boolean;
  // @ts-ignore
  public loggedInPublisher: BehaviorSubject<boolean>;

  constructor(private client: HttpClient) {
    console.log('auth service constructor');
    const session: SessionInfo | null = this.getSessionInfo();
    if (session === null) {
      this.isLoggedIn = false;
      this.loggedInPublisher = new BehaviorSubject<boolean>(this.isLoggedIn);
    }
    else {
      if (refreshTokenTokenIsExpired(session)) {
        console.log('refresh token expired, clearing session');
        AuthenticationService.clearSession();
        this.isLoggedIn = false;
        this.loggedInPublisher = new BehaviorSubject<boolean>(this.isLoggedIn);
      }
      else {
        this.isLoggedIn = true;
        this.loggedInPublisher = new BehaviorSubject<boolean>(this.isLoggedIn);
        this.refreshAccessToken().pipe(
          tap(() => {
            console.log('auth service refreshing access token.');
            this.isLoggedIn = true;
            this.loggedInPublisher.next(this.isLoggedIn);
          }),
          catchError(() => {
            console.log('auth service refresh failed');
            this.isLoggedIn = false;
            this.loggedInPublisher = new BehaviorSubject<boolean>(this.isLoggedIn);
            return of(false);
          }),
        ).subscribe();
      }
    }
  }


  // private static getExpiration(): { access_token_exp: number, refresh_token_exp: number } {
  //   const session: SessionInfo = JSON.parse(localStorage.getItem(SESSION_INFO_KEY) || '');
  //   return {
  //     access_token_exp: session.access_token.expiry,
  //     refresh_token_exp: session.refresh_token.expiry
  //   };
  // }

  private static clearSession(): void {
    localStorage.removeItem(SESSION_INFO_KEY);
  }

  private static setSession(authResult: AuthenticationResponse): void {
    const decodedAccessToken: TokenInfo = this.decodeToken(authResult.access_token);
    console.log('access', decodedAccessToken);
    const decodedRefreshToken: TokenInfo = this.decodeToken(authResult.refresh_token);
    console.log('refresh', decodedRefreshToken);

    const session: SessionInfo = {
      user: {...authResult.user},
      access_token: {
        token: authResult.access_token,
        expiry: decodedAccessToken.exp,
      },
      refresh_token: {
        token: authResult.refresh_token,
        expiry: decodedRefreshToken.exp,
      },
    };
    localStorage.setItem(SESSION_INFO_KEY, JSON.stringify(session));
  }

  // TODO: make jwt-decode work
  private static decodeToken(token: string): any{
    return JSON.parse(atob(token.split('.')[1]));
  }

  public getSessionInfo(): SessionInfo | null {
    const sessionData: string | null = localStorage.getItem(SESSION_INFO_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
}

  public refreshAccessToken(): Observable<SessionInfo> {
    let session: SessionInfo | null = this.getSessionInfo();
    if (session === null) {
      throw new Error('no session to refresh');
    }
    else {
      return this.client.post<RefreshResponse>(this.baseUrl + REFRESH_URL, {refresh: session.refresh_token.token}).pipe(
        switchMap((response: RefreshResponse) => {
          const accessTokenInfo: TokenInfo = AuthenticationService.decodeToken(response.access);
          session = session as SessionInfo;
          session.access_token.token = response.access;
          session.access_token.expiry = accessTokenInfo.exp;
          localStorage.setItem(SESSION_INFO_KEY, JSON.stringify(session));
          return of(session);
        })
      );
    }
  }


  public login(username: string, password: string): Observable<boolean> {
    return this.client.post<AuthenticationResponse>(
      this.baseUrl + LOGIN_URL, {username, password}
    ).pipe(
      tap(response => AuthenticationService.setSession(response)),
      tap(_ => {
        this.isLoggedIn = true;
        this.loggedInPublisher.next(this.isLoggedIn);
      }),
      // TODO: catch only 404
      catchError( () => {
        this.isLoggedIn = false;
        return of(false);
      }),
      switchMap(() => of(true)),
      finalize(() => this.loggedInPublisher.next(this.isLoggedIn)),
      shareReplay(),
    );
  }

  public logout(): Observable<any> {
    return this.client.post(this.baseUrl + LOGOUT_URL, null).pipe(
      tap(_ => {
        AuthenticationService.clearSession();
        this.isLoggedIn = false;
        this.loggedInPublisher.next(this.isLoggedIn);
      })
    );
  }
}
