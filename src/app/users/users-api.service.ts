import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {map, Observable, switchMap, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {GetUsersParams, UpdateUserPayload, User} from "./users.model";
import {GET_USERS_URL, GET_CSRF_TOKEN_URL, API_KEY} from '../app.config';


@Injectable({
	providedIn: 'root'
})
export class UsersApiService {

	private get headers(): HttpHeaders {
		return new HttpHeaders({
			'x-api-key': API_KEY,
		});
	}

	constructor(private http: HttpClient) {}

	/**
	 * Private method to fetch the CSRF token from the API.
	 */
	private getCsrfToken$(): Observable<string> {
		return this.http.get<{ csrfToken: string }>(GET_CSRF_TOKEN_URL, { headers: this.headers }).pipe(
			map(response => response.csrfToken),
			catchError(this.handleError)
		);
	}

	/**
	 * Fetches a single user by ID.
	 */
	getUserById$(userId: string): Observable<User> {
		return this.getCsrfToken$().pipe(
			switchMap(csrfToken => {
				const csrfHeaders = this.headers.set('x-csrf-token', csrfToken);
				return this.http.get<User>(`${GET_USERS_URL}/${userId}`, { headers: csrfHeaders });
			}),
			catchError(this.handleError)
		);
	}

	/**
	 * Fetches a paginated and filtered list of users from the API.
	 */
	getUsers$(params: GetUsersParams): Observable<User[]> {
		// Use HttpParams to correctly build the URL query string
		let httpParams = new HttpParams();

		// Append all the parameters to the HttpParams object.
		// It's important to use .set() for each parameter.
		if (params.filter_name) {
			httpParams = httpParams.set('filter_name', params.filter_name);
		}
		if (params.filter_organization_id) {
			httpParams = httpParams.set('filter_organization_id', params.filter_organization_id);
		}
		if (params.sort_by) {
			httpParams = httpParams.set('sort_by', params.sort_by);
		}
		if (params.sort_dir) {
			httpParams = httpParams.set('sort_dir', params.sort_dir);
		}
		httpParams = httpParams.set('pagination_limit', params.pagination_limit.toString());
		httpParams = httpParams.set('pagination_offset', params.pagination_offset.toString());

		return this.http.get<{ users: User[] }>(GET_USERS_URL, { headers: this.headers, params: httpParams }).pipe(
			// Use map to transform the response object to the users array
			map(response => {
				// Return an empty array if the response is not as expected
				return Array.isArray(response.users) ? response.users : [];
			}),
			catchError(this.handleError)
		);
	}

	/**
	 * Updates an existing user.
	 */
	updateUser(userId: string, payload: UpdateUserPayload): Observable<{ user: User }> {
		return this.getCsrfToken$().pipe(
			switchMap(csrfToken => {
				const csrfHeaders = this.headers.set('x-csrf-token', csrfToken);
				return this.http.put<{ user: User }>(`${GET_USERS_URL}/${userId}`, payload, { headers: csrfHeaders });
			}),
			catchError(this.handleError)
		);
	}

	private handleError(error: any): Observable<never> {
		console.error('An API error occurred', error);
		return throwError(() => new Error(error.message || 'Server Error'));
	}
}
