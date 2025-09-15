export interface Cat {
	id: string;
	image: string;
	title: string;
	date: Date;
	rating: number;
	rating_count: number;
	rating_sum: number;
}

export interface RateCatPayload extends Cat {
	rating: number;
}

export interface RateCatResponse extends Cat {
	success: boolean
}

export interface ListTopCats {
	cats: Array<Cat>
}
