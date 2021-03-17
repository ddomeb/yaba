import {Injectable, Injector} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SessionInfo, accessTokenIsExpired, refreshTokenTokenIsExpired} from '../common_models/sessioninfo.interface';
import {catchError, switchMap} from 'rxjs/operators';
import {AuthenticationService} from "../services/authentication.service";

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}

  // TODO: add token whitelist for endpoints
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const sessionData: string | null = localStorage.getItem('session_info');
    // TODO: delete session and redirect to login page?
    if (sessionData == null || req.url.includes('authentication/login/') || req.url.includes('token/refresh/')) { return next.handle(req); }
    const session: SessionInfo = JSON.parse(sessionData);

    if (!accessTokenIsExpired(session)) {
      return next.handle(this.addAccessTokenToRequest(req, session));
    }
    else if (!refreshTokenTokenIsExpired(session)) {
      const authenticationService: AuthenticationService = this.injector.get(AuthenticationService);
      return authenticationService.refreshAccessToken().pipe(
        switchMap((newSession: SessionInfo) => {
          return next.handle(this.addAccessTokenToRequest(req, newSession));
        }),
        catchError(() => next.handle(req))
      );
    }
    else {
      // TODO: clear session and redirect to login page?
      return next.handle(req);
    }
  }

  addAccessTokenToRequest(req: HttpRequest<any>, session: any): HttpRequest<any> {
    return req.clone({
      headers: req.headers.set('Authorization',
        'Bearer ' + session.access_token.token)
    });
  }
}
