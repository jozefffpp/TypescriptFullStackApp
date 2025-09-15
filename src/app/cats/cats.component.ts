import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
	selector: 'app-cats',
	templateUrl: './cats.component.html',
	styleUrls: ['./cats.component.scss'],
	imports: [RouterOutlet]
})
export class CatsComponent implements OnInit {

	constructor() {
	}

	ngOnInit(): void {
	}

}
