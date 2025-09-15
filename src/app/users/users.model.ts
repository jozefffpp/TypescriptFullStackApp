// Interface for the user object returned from the API
export interface User {
	id: number;
	email: string;
	name: string;
	timezone_id: number;
	country_id: number;
	locale_id: number;
	organizations_count: number;
	scenarios_count: number;
	active_scenarios_count: number;
	organizations_with_scenario: number[];
}

// Define the parameters for the getUsers$ method for type safety.
export interface GetUsersParams {
	filter_name?: string;
	filter_organization_id?: string;
	sort_by?: string;
	sort_dir?: 'ASC' | 'DESC';
	pagination_limit: number;
	pagination_offset: number;
}

export type UpdateUserPayload = Partial<Omit<User, 'id'>>;
