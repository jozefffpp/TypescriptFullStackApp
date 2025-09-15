import {Component, Input} from '@angular/core';

@Component({
	selector: 'loader',
	template: `
		@if (isLoading) {
		<div class="loader">
			<img src="/assets/loader.gif" class="card-img-top">
		</div>
		}
	`,
	styles: [
		`
			.loader {
				max-width: 100px;
				margin: 2rem auto;
				border-radius: 20px;
				overflow: hidden;
			}
		`
	]
})
export class LoaderComponent {
	@Input() public isLoading = false
}
