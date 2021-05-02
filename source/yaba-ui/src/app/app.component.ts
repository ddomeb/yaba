import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {AuthenticationService} from './services/authentication.service';
import {UserData} from './common_models/authentication.interface';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent{
  title = 'Yaba';
  public isLoggedInPublisher: BehaviorSubject<boolean>;
  public contentLoadable = new BehaviorSubject<boolean>(false);
  public userDataPublisher = new  BehaviorSubject<UserData | null>(null);

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
  ) {
    this.isLoggedInPublisher = this.authenticationService.loggedInPublisher;
    this.userDataPublisher = this.authenticationService.userDataPublisher;
    this.authenticationService.loadSessionStatus().subscribe(() => this.contentLoadable.next(true));
  }

  public logout(): void {
    this.authenticationService.logout().subscribe();
  }

  changePass(): void {
    this.router.navigate(['changePassword']);
  }
}
