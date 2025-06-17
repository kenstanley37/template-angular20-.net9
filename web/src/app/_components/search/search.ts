import { Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-search',
  imports: [CommonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search {
  private inputSubject = new Subject<string>();
  searchQuery = signal('');

  constructor() {
    this.inputSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(value => this.searchQuery.set(value));
  }

  onInput(value: string) {
    this.inputSubject.next(value);
  }
}
