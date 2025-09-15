import {RateCatPayload} from '../../cat';


export class LoadCats {
	static readonly type = '[cats] Load cats';
}

export class LoadRandomCat {
	static readonly type = '[cats] Load random cat';
}

export class RateCat {
	static readonly type = '[cats] rate random cat';
	constructor(public payload: RateCatPayload) {}
}

export class AddCat {
	public static readonly type = '[Cats] Add Cat';
	constructor(public payload: FormData) { }
}
