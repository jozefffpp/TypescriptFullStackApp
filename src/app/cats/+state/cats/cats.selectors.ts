import {Selector} from '@ngxs/store';
import {CatModel, CATS_STATE_TOKEN, CatStateModel} from './cats.model';

export class CatsSelectors {

	@Selector([CATS_STATE_TOKEN])
	public static getAllCats$(state: CatStateModel) {
		return state.ids.reduce((entities, id) => {
			entities.push(state.entities[id])
			return entities;
		}, [] as Array<CatModel>)
	}

	@Selector([CATS_STATE_TOKEN])
	public static isLoading$(state: CatStateModel) {
		return state?.loading || false ;
	}

	@Selector([CATS_STATE_TOKEN])
	public static getActiveCat$(state: CatStateModel) {
		if (!state.active || !state.entities) {
			return null
		}
		return state.entities[state.active] || null;
	}
}
