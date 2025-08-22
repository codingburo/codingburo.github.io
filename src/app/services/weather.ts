import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { APP_CONFIG } from '../constants/app.constants';
import { Auth } from '@angular/fire/auth';
@Injectable({
  providedIn: 'root',
})
export class Weather {
  private baseUrl = `${APP_CONFIG.API_BASE_URL}`;
  private auth = inject(Auth);
  constructor(private http: HttpClient) {}

  // getWeather(message: string): Observable<string> {
  //   return this.http.get(`${this.baseUrl}/weather?state=` + message, {
  //     responseType: 'text',
  //   });
  // }

  getWeather(message: string): Observable<string> {
    return this.http
      .get(`${this.baseUrl}/weather?state=` + message, {
        responseType: 'text',
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.status === 429) {
      errorMessage = error.error;
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized access. Please sign in again.';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else {
      errorMessage = 'Failed to get weather data';
    }

    return throwError(() => ({ status: error.status, message: errorMessage }));
  }

  getChat(prompt: string, sessionId: number): Observable<string> {
    return this.http
      .get(`${this.baseUrl}/chat`, {
        params: {
          prompt: prompt,
          sessionId: sessionId.toString(),
        },
        responseType: 'text',
      })
      .pipe(catchError(this.handleError));
  }
}
