import {Component, OnInit} from '@angular/core';
import {RouterLink} from "@angular/router";
import {FaIconComponent, FaIconLibrary} from "@fortawesome/angular-fontawesome";
import {faCat, faStar, faTrophy} from "@fortawesome/free-solid-svg-icons";

@Component({
	selector: 'app-welcome',
	templateUrl: './welcome.component.html',
	standalone: true,
	imports: [
		RouterLink,
		FaIconComponent
	],
	styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

	constructor(library: FaIconLibrary) {
		// Add icons to the library
		library.addIcons(faCat, faStar, faTrophy);
	}

	ngOnInit(): void {
	}

}
