import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog, ConfirmDialogData} from '../_components/confirm-dialog/confirm-dialog';
import { firstValueFrom } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ConfirmService {

  constructor() { }

  private dialog = inject(MatDialog);

  async confirm(data: ConfirmDialogData): Promise<boolean> {
    const ref = this.dialog.open(ConfirmDialog, {
      data,
      disableClose: true,
      width: '360px',
    });
    return await firstValueFrom(ref.afterClosed());
  }
}
