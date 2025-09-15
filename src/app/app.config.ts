import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { provideStates, provideStore } from "@ngxs/store";
import { provideHttpClient } from "@angular/common/http";
import { CatsState } from "./cats/+state/cats/cats.state";

// Define the base URL for your local server
const API_BASE_URL = 'http://localhost:4300';

// Define the specific API endpoints
export const GET_ALL_CATS_URL = `${API_BASE_URL}/api/cats/top-rated`;
export const GET_RANDOM_CAT_URL: string =`${API_BASE_URL}/api/cats/rate`;
export const UPDATE_CAT_RATING_URL = `${API_BASE_URL}/api/cat/rating`;
export const ADD_CAT_URL = `${API_BASE_URL}/api/cats/upload`;
export const GET_CSRF_TOKEN_URL = `${API_BASE_URL}/api/csrf-token`;
export const GET_USERS_URL = `${API_BASE_URL}/api/users`;
export const API_KEY = 'key123';


export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter(routes),
		provideStore([CatsState], {developmentMode: true}),
		provideStates([CatsState]),
		provideHttpClient()
	]
}
