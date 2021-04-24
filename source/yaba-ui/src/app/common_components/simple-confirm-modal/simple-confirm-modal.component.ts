import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-simple-confirm-modal',
  templateUrl: './simple-confirm-modal.component.html',
  styleUrls: ['./simple-confirm-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleConfirmModalComponent {

  @Input() message = 'Are you sure?';

  constructor(public readonly activeModal: NgbActiveModal) { }
}
