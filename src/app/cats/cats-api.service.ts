import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, switchMap, throwError } from 'rxjs';
import { Cat, ListTopCats, RateCatPayload, RateCatResponse } from './cat';
import {
	GET_ALL_CATS_URL,
	GET_RANDOM_CAT_URL,
	UPDATE_CAT_RATING_URL,
	ADD_CAT_URL,
	GET_CSRF_TOKEN_URL,
	API_KEY,
} from '../app.config';

@Injectable({
	providedIn: 'root'
})
export class CatsApiService {

	private get headers(): HttpHeaders {
		return new HttpHeaders({
			'x-api-key': API_KEY
		});
	}

	constructor(private http: HttpClient) {}

	private getCsrfToken$(): Observable<string> {
		return this.http.get<{ csrfToken: string }>(GET_CSRF_TOKEN_URL, { headers: this.headers }).pipe(
			map(response => response.csrfToken),
			catchError(this.handleError)
		);
	}

	getRandomCat$(): Observable<Cat> {
		return this.http.get<Cat>(GET_RANDOM_CAT_URL, { headers: this.headers }).pipe(
			catchError(this.handleError)
		);
	}

	postRateCat$(cat: RateCatPayload): Observable<RateCatResponse> {
		return this.getCsrfToken$().pipe(
			switchMap(csrfToken => {
				const csrfHeaders = this.headers.set('x-csrf-token', csrfToken);
				return this.http.post<RateCatResponse>(UPDATE_CAT_RATING_URL, cat, { headers: csrfHeaders });
			}),
			catchError(this.handleError)
		);
	}

	getListTop$(): Observable<ListTopCats> {
		return this.http.get<ListTopCats>(GET_ALL_CATS_URL, { headers: this.headers }).pipe(
			catchError(this.handleError)
		);
	}

	addCat$(formData: FormData): Observable<Cat[]> {
		return this.getCsrfToken$().pipe(
			switchMap(csrfToken => {
				const csrfHeaders = this.headers.set('x-csrf-token', csrfToken);
				return this.http.post<Cat[]>(ADD_CAT_URL, formData, { headers: csrfHeaders });
			}),
			catchError(this.handleError)
		);
	}

	private handleError(error: any): Observable<never> {
		console.error('An API error occurred', error);
		return throwError(() => new Error(error.message || 'Server Error'));
	}
}
