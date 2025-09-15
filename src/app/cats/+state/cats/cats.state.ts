import {Action, State, StateContext} from '@ngxs/store';
import {CatsApiService} from '../../cats-api.service';
import {Injectable} from '@angular/core';
import {AddCat, LoadCats, LoadRandomCat, RateCat} from './cats.actions';
import {finalize, tap} from 'rxjs/operators';
import {CATS_STATE_TOKEN, CatStateModel, getCatStateModel} from './cats.model';
import {addOrReplace, addOrUpdateEntity, setActiveEntity} from '../../../store.utils';
import { Cat } from '../../cat';


/**
 * https://www.ngxs.io/concepts/state
 */

@State({
	name: CATS_STATE_TOKEN,
	defaults: getCatStateModel()
})
@Injectable()
export class CatsState {

	constructor(private catsApiService: CatsApiService) {}

	/**
	 *
	 * @description
	 * State listen to actions via an @Action decorator. The action decorator accepts an action class or an array of action classes.
	 *
	 * Action listener is the pattern which is similar to Reducer pattern in the Redux which also combines
	 * ngrx Effect pattern. Main purpose of the action listener is listen to action and change the state
	 *
	 * context state <StateContext<CatStateModel>> has a slice pointer and a function exposed to set the state.
	 * It's important to note that the getState() method will always return the freshest state slice from
	 * the global store each time it is accessed.
	 *
	 */

	@Action(LoadCats)
	public loadCats(ctx: StateContext<CatStateModel>) {
		const state = { ...ctx.getState() };
		ctx.patchState({...state, ...{loading: true}})
		return this.catsApiService.getListTop$().pipe(
			tap((res) => {
				// function which does the state mutation
				addOrReplace(ctx,  res.cats);
			}),
			finalize(() => {
				ctx.patchState( {loading: false})
			})
		)
	}

	@Action(LoadRandomCat)
	public loadRandomCat(ctx: StateContext<CatStateModel>) {
		// Set the loading flag to true
		ctx.patchState({ loading: true });

		// Return the observable from the API call
		return this.catsApiService.getRandomCat$().pipe(
			tap(cat => {
				// Use the utility functions to add/update the entity and set it as active.
				addOrUpdateEntity(ctx, cat);
				setActiveEntity(ctx, cat.id);
			}),
			finalize(() => {
				// Always set loading to false when the API call is complete (success or fail)
				ctx.patchState({ loading: false });
			})
		)
	}

	@Action(RateCat)
	public rateCat(ctx: StateContext<CatStateModel>, action: RateCat) {
		// Set loading to true
		ctx.patchState({ loading: true });
		return this.catsApiService.postRateCat$(action.payload).pipe(
			tap((response) => {
				// If the API returns the updated cat, use the utility function to update the state.
				if (response.success) {
					const updatedCat = {
						id: response.id,
						rating: response.rating,
						rating_count: response.rating_count
					};
					addOrUpdateEntity(ctx, updatedCat);
				}
			}),
			finalize(() => {
				// Always set loading to false
				ctx.patchState({ loading: false });
			})
		);
	}

	@Action(AddCat)
	public addCat(ctx: StateContext<CatStateModel>, action: AddCat) {
		ctx.patchState({ loading: true });
		return this.catsApiService.addCat$(action.payload).pipe(
			tap((newCats: Cat[]) => {
				// Use the utility function to add all new cats to the state.
				addOrReplace(ctx, newCats);
			}),
			finalize(() => {
				ctx.patchState({ loading: false });
			})
		);
	}
}
