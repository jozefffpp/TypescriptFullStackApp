import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { faMeh, faPoo, faGrinHearts } from '@fortawesome/free-solid-svg-icons';
import {
	BehaviorSubject,
	Subject,
	takeUntil,
	concatMap,
	filter,
	map,
	share,
	startWith,
	tap,
	withLatestFrom,
	debounceTime,
	observeOn,
	asyncScheduler,
} from 'rxjs';
import {Cat, RateCatPayload} from '../cat';
import { LoaderComponent } from '../loader/loader.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule, DatePipe } from '@angular/common';
import {CatsFacade} from "../+state/cats/cats.facade";


@Component({
	selector: 'app-rate',
	templateUrl: './rate.component.html',
	styleUrls: ['./rate.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [LoaderComponent, FontAwesomeModule, DatePipe, CommonModule, ReactiveFormsModule]
})
export class RateComponent implements OnInit, OnDestroy {
	public readonly dislikeIcon = faPoo;
	public readonly neutralIcon = faMeh;
	public readonly likeIcon = faGrinHearts;

	public showIndicator$ = new BehaviorSubject(false);
	public form: FormGroup = new FormGroup({rating: new FormControl(null)});

	private unsubscribe$ = new Subject<void>();

	public cat$ = this.catsFacade.activeCat$;
	public isLoading$ = this.catsFacade.isLoading$.pipe(
		startWith(null),
		share(),
	);

	constructor(private catsFacade: CatsFacade) {
	}

	ngOnInit(): void {
		// Load the first random cat
		this.catsFacade.loadRandomCat$().pipe(
			takeUntil(this.unsubscribe$),
		).subscribe();

		this.form.valueChanges
			.pipe(
				map(value => value.rating),
				filter(rating => rating !== null),
				tap(() => this.showIndicator$.next(false)),
				observeOn(asyncScheduler),
				tap(() => this.showIndicator$.next(true)),
				debounceTime(3_000),
				withLatestFrom(this.cat$),
				concatMap(([rating, cat]) => {
					const payload: RateCatPayload = {...cat as Cat, rating};
					return this.catsFacade.rateCat$(payload).pipe(
						// After the rating is done, load a new random cat.
						concatMap(() => this.catsFacade.loadRandomCat$())
					);
				}),
				takeUntil(this.unsubscribe$),
			)
			.subscribe(() => {
				this.showIndicator$.next(false);
				this.form.setValue({rating: null});
			});
	}

	ngOnDestroy() {
		this.unsubscribe$.next();
	}
}
