import { CommonModule } from '@angular/common';
import { Component, inject, signal, effect, OnInit, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PictureDialog } from '../picture-dialog/picture-dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-picture-viewer',
  imports: [
    CommonModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    MatIconModule,
  ],
  templateUrl: './picture-viewer.html',
  styleUrl: './picture-viewer.scss'
})
export class PictureViewer {
  readonly dialog = inject(MatDialog);

  totalImages = signal(15);
  currentPage = signal(1);
  imagesPerPage = 6;

  images = computed(() =>
    Array.from({ length: this.totalImages() }, (_, i) => `https://picsum.photos/300/200?random=${i + 1}`)
  );

  totalPages = computed(() =>
    Math.ceil(this.totalImages() / this.imagesPerPage)
  );

  paginatedImages = computed(() => {
    const start = (this.currentPage() - 1) * this.imagesPerPage;
    return this.images().slice(start, start + this.imagesPerPage);
  });

  updateTotalImages(val: number) {
    const count = Math.max(1, Math.min(100, val || 1));
    this.totalImages.set(count);
    this.currentPage.set(1); // reset to first page
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  openFullscreen(img: string) {
    this.dialog.open(PictureDialog, {
      data: { img },
      panelClass: 'fullscreen-dialog'
    });
  }
}
