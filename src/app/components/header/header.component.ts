import {Component, OnInit} from '@angular/core';
import {RouterLinkActive, RouterLinkWithHref} from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faCat} from '@fortawesome/free-solid-svg-icons';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
	imports: [FontAwesomeModule, RouterLinkWithHref, RouterLinkActive]
})
export class HeaderComponent implements OnInit {
	faCat = faCat;

	constructor() {
	}

	ngOnInit(): void {
	}

}
