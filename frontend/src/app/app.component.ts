import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Word, WordService, ExamplesResponse } from './word.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <header>
        <h1>EnglishLearn</h1>
        <p class="subtitle">Register English words and their translations.</p>
      </header>

      <form (ngSubmit)="saveWord()">
        <input
          name="english"
          placeholder="English word"
          [(ngModel)]="english"
          required
        />
        <input
          name="portuguese"
          placeholder="Portuguese translation"
          [(ngModel)]="portuguese"
          required
        />
        <button type="submit" [disabled]="loading">Save</button>
      </form>

      <div *ngIf="message" class="alert" [class.success]="messageType === 'success'">
        {{ message }}
      </div>

      <div *ngIf="words.length" class="word-count">
        Total words: <strong>{{ words.length }}</strong>
      </div>

      <table *ngIf="words.length">
        <thead>
          <tr>
            <th>English</th>
            <th>Portuguese</th>
            <th>Class</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let word of words" class="word-row" (mouseenter)="onRowHover($event, word)" (mouseleave)="onRowLeave()">
            <td>
              <ng-container *ngIf="editingId !== word.id; else editEnglishTpl">
                {{ word.english }}
              </ng-container>
              <ng-template #editEnglishTpl>
                <input [(ngModel)]="editEnglish" name="editEnglish{{ word.id }}" />
              </ng-template>
            </td>
            <td>
              <ng-container *ngIf="editingId !== word.id; else editPortugueseTpl">
                {{ word.portuguese }}
              </ng-container>
              <ng-template #editPortugueseTpl>
                <input [(ngModel)]="editPortuguese" name="editPortuguese{{ word.id }}" />
              </ng-template>
            </td>
            <td>{{ word.partOfSpeech || '-' }}</td>
            <td>
              <ng-container *ngIf="editingId !== word.id; else editActionsTpl">
                <button type="button" (click)="startEdit(word)">Edit</button>
                <button type="button" (click)="removeWord(word)">Delete</button>
              </ng-container>
              <ng-template #editActionsTpl>
                <button type="button" (click)="applyEdit(word)">Save</button>
                <button type="button" (click)="cancelEdit()">Cancel</button>
              </ng-template>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="showExamplesPopover" class="examples-popover" [style.top.px]="popoverTop" [style.left.px]="popoverLeft">
        <div class="popover-header">
          <strong>{{ hoveredWord?.english }}</strong>
          <button type="button" class="close-btn" (click)="onRowLeave()">×</button>
        </div>
        <div *ngIf="examplesLoading" class="popover-loading">Loading examples...</div>
        <div *ngIf="!examplesLoading && examplesData" class="popover-content">
          <p *ngFor="let example of examplesData.examples" class="example-sentence">{{ example }}</p>
        </div>
        <div *ngIf="!examplesLoading && examplesError" class="popover-error">{{ examplesError }}</div>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  words: Word[] = [];
  english = '';
  portuguese = '';
  message = '';
  messageType: 'success' | 'error' = 'success';
  loading = false;
  editingId: number | null = null;
  editEnglish = '';
  editPortuguese = '';

  showExamplesPopover = false;
  hoveredWord: Word | null = null;
  examplesData: ExamplesResponse | null = null;
  examplesLoading = false;
  examplesError = '';
  popoverTop = 0;
  popoverLeft = 0;
  
  private examplesSubscription: Subscription | null = null;
  private lastRequestedWord: string = '';

  constructor(private readonly wordService: WordService) {}

  ngOnInit(): void {
    this.loadWords();
  }

  ngOnDestroy(): void {
    this.examplesSubscription?.unsubscribe();
  }

  saveWord(): void {
    this.message = '';
    this.messageType = 'success';
    this.loading = true;

    this.wordService.createWord(this.english, this.portuguese).subscribe({
      next: (created) => {
        this.words = [created, ...this.words];
        this.english = '';
        this.portuguese = '';
        this.message = 'Word saved successfully.';
        this.loading = false;
      },
      error: (error) => {
        if (error?.status === 409) {
          this.message = 'This word has already been registered.';
        } else {
          this.message = 'Could not save the word.';
        }
        this.messageType = 'error';
        this.loading = false;
      }
    });
  }

  startEdit(word: Word): void {
    this.editingId = word.id;
    this.editEnglish = word.english;
    this.editPortuguese = word.portuguese;
    this.message = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editEnglish = '';
    this.editPortuguese = '';
  }

  applyEdit(word: Word): void {
    this.message = '';
    this.messageType = 'success';

    this.wordService.updateWord(word.id, this.editEnglish, this.editPortuguese).subscribe({
      next: (updated) => {
        this.words = this.words.map((item) => (item.id === updated.id ? updated : item));
        this.message = 'Word updated successfully.';
        this.cancelEdit();
      },
      error: (error) => {
        if (error?.status === 409) {
          this.message = 'This word has already been registered.';
        } else if (error?.status === 404) {
          this.message = 'Word not found.';
        } else {
          this.message = 'Could not update the word.';
        }
        this.messageType = 'error';
      }
    });
  }

  removeWord(word: Word): void {
    this.message = '';
    this.messageType = 'success';

    this.wordService.deleteWord(word.id).subscribe({
      next: () => {
        this.words = this.words.filter((item) => item.id !== word.id);
        this.message = 'Word deleted successfully.';
        if (this.editingId === word.id) {
          this.cancelEdit();
        }
      },
      error: () => {
        this.message = 'Could not delete the word.';
        this.messageType = 'error';
      }
    });
  }

  onRowHover(event: MouseEvent, word: Word): void {
    if (this.editingId !== null) return;
    
    this.hoveredWord = word;
    this.showExamplesPopover = true;
    this.examplesLoading = true;
    this.examplesError = '';
    this.examplesData = null;
    
    // Cancel previous request if still pending
    if (this.examplesSubscription) {
      this.examplesSubscription.unsubscribe();
    }
    
    // Track which word we're requesting
    this.lastRequestedWord = word.english;
    
    // Get the row element position
    const row = (event.currentTarget as HTMLElement);
    const rect = row.getBoundingClientRect();
    
    // Calculate popover position
    const popoverHeight = 200; // Approximate height of popover
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // Position popover above or below based on available space
    let top: number;
    if (spaceBelow > popoverHeight) {
      top = rect.bottom + window.scrollY + 8; // 8px gap below row
    } else if (spaceAbove > popoverHeight) {
      top = rect.top + window.scrollY - popoverHeight - 8; // 8px gap above row
    } else {
      // If no space, default to below
      top = rect.bottom + window.scrollY + 8;
    }
    
    const left = rect.left + window.scrollX + 16; // 16px gap from left edge
    
    this.popoverTop = top;
    this.popoverLeft = left;

    this.examplesSubscription = this.wordService.getExamples(word.english).subscribe({
      next: (data) => {
        // Only display if this response is for the word currently being hovered
        if (data.word === this.lastRequestedWord && this.hoveredWord?.english === data.word) {
          console.log('Examples loaded:', data);
          this.examplesData = data;
          this.examplesLoading = false;
        }
      },
      error: (error) => {
        // Only show error if this was the last requested word
        if (word.english === this.lastRequestedWord) {
          console.error('Error loading examples:', error);
          this.examplesLoading = false;
          this.examplesError = 'Could not load examples. Make sure the AI service is running.';
        }
      }
    });
  }

  onRowLeave(): void {
    this.showExamplesPopover = false;
    this.hoveredWord = null;
    this.examplesData = null;
    this.lastRequestedWord = '';
    
    // Cancel pending request
    if (this.examplesSubscription) {
      this.examplesSubscription.unsubscribe();
      this.examplesSubscription = null;
    }
  }

  private loadWords(): void {
    this.wordService.listWords().subscribe({
      next: (data) => {
        this.words = data;
      },
      error: () => {
        this.message = 'Could not load words.';
        this.messageType = 'error';
      }
    });
  }
}
