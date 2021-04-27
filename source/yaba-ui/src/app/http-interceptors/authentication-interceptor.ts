import {Injectable, Injector} from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {SessionInfo, accessTokenIsExpired, refreshTokenTokenIsExpired} from '../common_models/sessioninfo.interface';
import {catchError, switchMap, tap} from 'rxjs/operators';
import {AuthenticationService} from '../services/authentication.service';
import {Router} from '@angular/router';
import {ToastService} from '../common_components/toast-container/toast.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
  private whitelistedURLs = [
    'authentication/login/',
    'token/refresh/',
    'register/',
    'authentication/logout/',
  ];

  private isWhiteListed(url: string): boolean {
    return this.whitelistedURLs.some((element: string) => url.includes(element));
  }

  constructor(
    private readonly injector: Injector,
    private readonly router: Router,
    private readonly toast: ToastService,
    private readonly modalService: NgbModal
  ) {}


  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isWhiteListed(req.url)) { console.log('interceptor whitelist:', req); return next.handle(req); }
    console.log('interceptor');
    const sessionData: string | null = localStorage.getItem('session_info');
    if (sessionData === null) {
      console.log('interceptor, session null: ', req);
      return next.handle(req).pipe(
        tap(
          () => {},
          (err: any) => {
            if (err instanceof HttpErrorResponse) {
              if (err.status !== 401) {
                return;
              }
              console.log('got 401, no session');
              this.injector.get(AuthenticationService).clearSessionInfo();
              this.modalService.dismissAll('nok');
              this.toast.showDanger('Please login in first!');
              this.router.navigate( ['login']);
            }
          }
        ),
      );
    }
    const session: SessionInfo = JSON.parse(sessionData);

    if (!accessTokenIsExpired(session)) {
      console.log('interceptor, access token valid: ', req);
      return next.handle(this.addAccessTokenToRequest(req, session));
    }
    else if (!refreshTokenTokenIsExpired(session)) {
      console.log('interceptor, refresh token valid');
      const authenticationService: AuthenticationService = this.injector.get(AuthenticationService);
      return authenticationService.refreshAccessToken().pipe(
        switchMap((newSession: SessionInfo) => {
          console.log('interceptor, refresh successful: ', req);
          return next.handle(this.addAccessTokenToRequest(req, newSession));
        }),
        catchError(() => next.handle(req))
      );
    }
    else {
      AuthenticationService.clearSession();
      console.log('interceptor, no valid token: ', req);
      return next.handle(req).pipe(
        tap(
          () => {},
          (err: any) => {
            if (err instanceof HttpErrorResponse) {
              if (err.status === 401){
                console.log('got 401, session cleared');
                this.injector.get(AuthenticationService).clearSessionInfo();
                this.modalService.dismissAll('nok');
                this.toast.showDanger('Please login in first!');
                this.router.navigate(['login']).then(() => console.log('redirected'));
                return;
              }
              return;
            }
          }
        ),
      );
    }
  }

  addAccessTokenToRequest(req: HttpRequest<any>, session: any): HttpRequest<any> {
    return req.clone({
      headers: req.headers.set('Authorization',
        'Bearer ' + session.access_token.token)
    });
  }
}
