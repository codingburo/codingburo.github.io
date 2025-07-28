import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../constants/app.constants';
@Injectable({
  providedIn: 'root'
})
export class Weather{
  private baseUrl = `${APP_CONFIG.API_BASE_URL}`;
  constructor(private http: HttpClient) { }

  getWeather(message:string):Observable<string>{
    return this.http.get(
      `${this.baseUrl}/weather?state=` + message,
      { responseType: 'text' }
    );
  }
  
}
