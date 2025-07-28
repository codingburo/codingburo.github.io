import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private baseUrl = 'http://localhost:7304';
  constructor(private http: HttpClient) {}

  getWeather(message: string): Observable<string> {
    return this.http.get(`${this.baseUrl}/email?message=` + message, {
      responseType: 'text',
    });
  }
}
