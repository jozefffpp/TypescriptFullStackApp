import { Routes} from "@angular/router";
import { WelcomeComponent } from "./welcome/welcome.component";
import {ListUsersComponent} from "./users/list-users/list-users.component";
import {EditUserComponent} from "./users/edit-user/edit-user.component";

export const routes: Routes = [
	{
		path: '',
		component: WelcomeComponent
	},
	{
		path: 'users',
		component: ListUsersComponent,
	},
	{
		path: 'edit-user/:id',
		component: EditUserComponent,
	},
	{
		path: 'cats',
		loadChildren: () => import('./cats/cats.routes').then((m) => m.catsRoutes),
	}

];
