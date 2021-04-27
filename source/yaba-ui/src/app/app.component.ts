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
  public contentLoadable = new BehaviorSubject<boolean>(false);

  constructor(private authenticationService: AuthenticationService) {
    this.isLoggedInPublisher = this.authenticationService.loggedInPublisher;
    this.authenticationService.loadSessionStatus().subscribe(() => this.contentLoadable.next(true));
  }

  public logout(): void {
    this.authenticationService.logout().subscribe();
  }
}
