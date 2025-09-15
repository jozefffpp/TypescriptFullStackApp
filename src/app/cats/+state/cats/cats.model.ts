import {StateToken} from '@ngxs/store';
import {EntityStateModel} from '../../../store.utils';

export interface CatModel {
	id: string;
	image: string;
	title: string;
	date: Date;
	rating: number;
	rating_count: number;
	rating_sum: number;
}

export type CatStateModel = EntityStateModel<CatModel>;

export function getCatStateModel(): CatStateModel {
	return {
		ids: [],
		entities: {},
		/**
		 * currently selected/active entity
		 */
		active: null,
		loading: false,
	}
}

export const CATS_STATE_TOKEN = new StateToken<EntityStateModel<CatModel>>(
	'cats',
);
