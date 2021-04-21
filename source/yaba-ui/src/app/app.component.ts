import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {AuthenticationService} from './services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent{
  title = 'Yaba';
  public isLoggedInPublisher: BehaviorSubject<boolean>;

  constructor(private authenticationService: AuthenticationService) {
    this.isLoggedInPublisher = this.authenticationService.loggedInPublisher;
  }

  public logout(): void {
    this.authenticationService.logout().subscribe();
  }
}
