import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Word, WordService } from './word.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <header>
        <h1>EnglishLearn</h1>
        <p class="subtitle">Cadastre palavras em ingles e sua traducao.</p>
      </header>

      <form (ngSubmit)="saveWord()">
        <input
          name="english"
          placeholder="Palavra em ingles"
          [(ngModel)]="english"
          required
        />
        <input
          name="portuguese"
          placeholder="Traducao em portugues"
          [(ngModel)]="portuguese"
          required
        />
        <button type="submit" [disabled]="loading">Salvar</button>
      </form>

      <div *ngIf="message" class="alert" [class.success]="messageType === 'success'">
        {{ message }}
      </div>

      <div *ngIf="words.length" class="word-count">
        Total de palavras: <strong>{{ words.length }}</strong>
      </div>

      <table *ngIf="words.length">
        <thead>
          <tr>
            <th>Ingles</th>
            <th>Portugues</th>
            <th>Classe</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let word of words">
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
                <button type="button" (click)="startEdit(word)">Editar</button>
                <button type="button" (click)="removeWord(word)">Excluir</button>
              </ng-container>
              <ng-template #editActionsTpl>
                <button type="button" (click)="applyEdit(word)">Salvar</button>
                <button type="button" (click)="cancelEdit()">Cancelar</button>
              </ng-template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AppComponent implements OnInit {
  words: Word[] = [];
  english = '';
  portuguese = '';
  message = '';
  messageType: 'success' | 'error' = 'success';
  loading = false;
  editingId: number | null = null;
  editEnglish = '';
  editPortuguese = '';

  constructor(private readonly wordService: WordService) {}

  ngOnInit(): void {
    this.loadWords();
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
        this.message = 'Palavra salva com sucesso.';
        this.loading = false;
      },
      error: (error) => {
        if (error?.status === 409) {
          this.message = 'Essa palavra ja foi cadastrada.';
        } else {
          this.message = 'Nao foi possivel salvar a palavra.';
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
        this.message = 'Palavra atualizada com sucesso.';
        this.cancelEdit();
      },
      error: (error) => {
        if (error?.status === 409) {
          this.message = 'Essa palavra ja foi cadastrada.';
        } else if (error?.status === 404) {
          this.message = 'Palavra nao encontrada.';
        } else {
          this.message = 'Nao foi possivel atualizar a palavra.';
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
        this.message = 'Palavra excluida com sucesso.';
        if (this.editingId === word.id) {
          this.cancelEdit();
        }
      },
      error: () => {
        this.message = 'Nao foi possivel excluir a palavra.';
        this.messageType = 'error';
      }
    });
  }

  private loadWords(): void {
    this.wordService.listWords().subscribe({
      next: (data) => {
        this.words = data;
      },
      error: () => {
        this.message = 'Nao foi possivel carregar as palavras.';
        this.messageType = 'error';
      }
    });
  }
}
