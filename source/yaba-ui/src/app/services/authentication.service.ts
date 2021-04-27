import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {catchError, finalize, shareReplay, switchMap, take, tap} from 'rxjs/operators';
// import jwtDecode, { JwtPayload } from 'jwt-decode';
import {SessionInfo, refreshTokenTokenIsExpired, accessTokenIsExpired} from '../common_models/sessioninfo.interface';
import {AuthenticationResponse, UserData} from '../common_models/authentication.interface';
import {ToastService} from '../common_components/toast-container/toast.service';

interface TokenInfo {
  exp: number;
  jti: string;
  token_type: string;
  user_id: number;
}

interface RefreshResponse {
  access: string;
  access_token_expiration: number;
  refresh: string;
}

const SESSION_INFO_KEY = 'session_info';

const LOGIN_URL = 'authentication/login/';
const LOGOUT_URL = 'authentication/logout/';
const REFRESH_URL = 'authentication/token/refresh/';
const VERIFY_URL = 'authentication/token/verify/';
const REGISTER_URL = 'register/';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private baseUrl = 'http://127.0.0.1:8000/';

  private isLoggedIn = false;
  public userDataPublisher = new BehaviorSubject<UserData | null>(null);
  public loggedInPublisher = new BehaviorSubject<boolean>(this.isLoggedIn);

  constructor(private client: HttpClient, private readonly toast: ToastService) {
    console.log('auth service constructor');
  }

  public static getSessionInfo(): SessionInfo | null {
    const sessionData: string | null = localStorage.getItem(SESSION_INFO_KEY);
    console.log('session from local storage', sessionData);
    return sessionData ? JSON.parse(sessionData) : null;
  }

  static clearSession(): void {
    localStorage.removeItem(SESSION_INFO_KEY);
  }

  public static setSession(authResult: AuthenticationResponse): void {
    const decodedAccessToken: TokenInfo = this.decodeToken(authResult.access_token);
    const decodedRefreshToken: TokenInfo = this.decodeToken(authResult.refresh_token);
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

  private static decodeToken(token: string): any{
    return JSON.parse(atob(token.split('.')[1]));
  }

  public loadSessionStatus(): Observable<any> {
    const session: SessionInfo | null = AuthenticationService.getSessionInfo();

    if (session === null) {
      this.isLoggedIn = false;
      this.loggedInPublisher.next(this.isLoggedIn);
      this.userDataPublisher.next(null);
      console.log('auth service constructor, session null');
      return of(false);
    }
    else {
      if (refreshTokenTokenIsExpired(session)) {
        this.clearSessionInfo();
        return of(false);
        console.log('auth service constructor, refresh token expired');
      }
      else {
        if (accessTokenIsExpired(session)) {
          console.log('auth service constructor, access token expired');
          return this.refreshAccessToken().pipe(
            tap(() => {
              this.isLoggedIn = true;
              this.loggedInPublisher.next(this.isLoggedIn);
              this.userDataPublisher.next(session.user);
              console.log('auth service constructor, access token expired, refreshed');
            }),
            catchError(() => {
              console.log('auth service constructor, access token expired, refresh failed');
              this.clearSessionInfo();
              return of(false);
            }),
            switchMap(() => of(true))
          );
        }
        else {
          console.log('auth service constructor, access token valid');
          this.isLoggedIn = true;
          this.loggedInPublisher.next(this.isLoggedIn);
          this.userDataPublisher.next(session.user);
          return of(false);
        }
      }
    }
  }



  public sendRegistration(username: string, password: string, email: string): Observable<any> {
    return this.client.post(
      'registration/',
      {username, password1: password, password2: password, email}
    );
  }

  public refreshAccessToken(): Observable<any> {
    let session: SessionInfo | null = AuthenticationService.getSessionInfo();
    if (session === null) {
      throw new Error('no session to refresh');
    }
    else {
      return this.client.post<RefreshResponse>(this.baseUrl + REFRESH_URL, {refresh: session.refresh_token.token}).pipe(
        switchMap((response: RefreshResponse) => {
          console.log('refresh response:', response);
          console.log('refresh, session before:', response);
          const accessTokenInfo: TokenInfo = AuthenticationService.decodeToken(response.access);
          const refreshTokenInfo: TokenInfo = AuthenticationService.decodeToken(response.refresh);
          session = session as SessionInfo;
          session.access_token.token = response.access;
          session.access_token.expiry = accessTokenInfo.exp;
          session.refresh_token.token = response.refresh;
          session.refresh_token.expiry = refreshTokenInfo.exp;
          localStorage.setItem(SESSION_INFO_KEY, JSON.stringify(session));
          console.log('refresh, session after:', session);
          return of(AuthenticationService.getSessionInfo());
        })
      );
    }
  }


  public login(username: string, password: string): Observable<boolean> {
    return this.client.post<AuthenticationResponse>(
      this.baseUrl + LOGIN_URL, {username, password}
    ).pipe(
      tap(response => AuthenticationService.setSession(response)),
      tap((response: AuthenticationResponse) => {
        this.isLoggedIn = true;
        this.loggedInPublisher.next(this.isLoggedIn);
        this.userDataPublisher.next(response.user);
      }),
      switchMap(() => of(true)),
      catchError( (err, caught) => {
        if (err instanceof HttpErrorResponse && err.status === 400){
          this.clearSessionInfo();
          return of(false);
        }
        return caught;
      }),
      shareReplay(),
    );
  }

  public logout(): Observable<any> {
    const session: SessionInfo | null = AuthenticationService.getSessionInfo();
    if (session === null) {
      this.clearSessionInfo();
      // TODO: redirect
      return of(true);
    }
    return this.client.post(this.baseUrl + LOGOUT_URL, {refresh: session.refresh_token.token}).pipe(
      tap(
        () => {
          this.toast.showSuccess('Logged out, see you later!');
          this.clearSessionInfo();
        }
      ),
      catchError(() => {
        this.toast.showDanger('Something went wrong.');
        return of(false);
      }),
      switchMap(() => of(true))
    );
  }

  public clearSessionInfo(): void {
    AuthenticationService.clearSession();
    this.isLoggedIn = false;
    this.loggedInPublisher.next(this.isLoggedIn);
    this.userDataPublisher.next(null);
  }
}
