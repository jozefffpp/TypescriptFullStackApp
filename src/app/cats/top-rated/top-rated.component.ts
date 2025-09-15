import {Component, OnDestroy, OnInit} from '@angular/core';
import {CatsFacade} from '../+state/cats/cats.facade';
import { LoaderComponent } from '../loader/loader.component';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import {Subject, takeUntil} from "rxjs";

@Component({
	selector: 'app-top-rated',
	templateUrl: './top-rated.component.html',
	styleUrls: ['./top-rated.component.scss'],
	imports: [LoaderComponent, AsyncPipe, NgIf, NgFor]
})
export class TopRatedComponent implements OnInit, OnDestroy {

	public cats$ = this.catsFacade.cats$;
	public isLoading$ = this.catsFacade.isLoading$;
	private destroy$ = new Subject<void>();

	constructor(private catsFacade: CatsFacade) {}

	ngOnInit(): void {
		this.catsFacade.loadAllCats$()
			.pipe(takeUntil(this.destroy$))
			.subscribe();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
