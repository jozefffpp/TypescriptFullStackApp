import { Routes } from "@angular/router";
import { CatsComponent } from "./cats.component";
import { RateComponent } from "./rate/rate.component";
import { TopRatedComponent } from "./top-rated/top-rated.component";
import {AddCatComponent} from "./add-cat/add-cat.component";


export const catsRoutes: Routes = [
	{
		path: '',
		component: CatsComponent,
		children: [
			{path: 'rate', component: RateComponent},
			{path: 'top-rated', component: TopRatedComponent},
			{path: 'add', component: AddCatComponent},
		]
	},
];
