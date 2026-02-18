import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Word {
  id: number;
  english: string;
  portuguese: string;
  partOfSpeech?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WordService {
  private readonly apiUrl = 'http://localhost:8080';

  constructor(private readonly http: HttpClient) {}

  listWords(): Observable<Word[]> {
    return this.http.get<Word[]>(`${this.apiUrl}/words`);
  }

  createWord(english: string, portuguese: string): Observable<Word> {
    return this.http.post<Word>(`${this.apiUrl}/words`, { english, portuguese });
  }

  updateWord(id: number, english: string, portuguese: string): Observable<Word> {
    return this.http.put<Word>(`${this.apiUrl}/words/${id}`, { english, portuguese });
  }

  deleteWord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/words/${id}`);
  }
}
