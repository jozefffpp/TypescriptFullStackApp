import {ChangeDetectionStrategy, Component, signal, OnInit, inject, computed, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {finalize, Subject, takeUntil} from 'rxjs';
import {GetUsersParams, User} from "../users.model";
import {UsersApiService} from "../users-api.service";
import {Router} from "@angular/router";

@Component({
	selector: 'app-list-users',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: './list-users.component.html',
	styles: [
		`
            .container { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
        `
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListUsersComponent implements OnInit, OnDestroy {
	private usersApiService = inject(UsersApiService);
	private fb = inject(FormBuilder);
	private router = inject(Router);
	private destroy$ = new Subject<void>();
	readonly paginationLimit = 50;

	// State signals
	users = signal<User[]>([]);
	loading = signal(false);
	currentPageOffset = signal(0);
	hasMoreUsers = signal(false);

	// Reactive form for filters
	filterForm = this.fb.nonNullable.group({
		filter_name: [''],
		filter_organization_id: [''],
		sort_by: ['id'],
		sort_dir: ['ASC'],
	});

	// Computed signals for UI state
	currentPage = computed(() => Math.floor(this.currentPageOffset() / this.paginationLimit) + 1);
	canGoBack = computed(() => this.currentPageOffset() > 0);
	canGoNext = computed(() => this.hasMoreUsers());

	ngOnInit(): void {
		this.fetchUsers();

		// Subscribe to form value changes to automatically fetch new data
		this.filterForm.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.currentPageOffset.set(0);
				this.fetchUsers();
			});
	}

	ngOnDestroy(): void {
		// Clean up all subscriptions.
		this.destroy$.next();
		this.destroy$.complete();
	}

	/**
	 * Fetches users from the API based on current filters and pagination.
	 */
	fetchUsers(): void {
		this.loading.set(true);

		// Get filter and sort values from the form
		const formValue = this.filterForm.getRawValue();

		const params: GetUsersParams = {
			pagination_limit: this.paginationLimit + 1, // Fetch one extra to check if there's a next page
			pagination_offset: this.currentPageOffset(),
			filter_name: formValue.filter_name,
			filter_organization_id: formValue.filter_organization_id,
			sort_by: formValue.sort_by,
			sort_dir: formValue.sort_dir as 'ASC' | 'DESC',
		};

		this.usersApiService.getUsers$(params)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => this.loading.set(false))
			)
			.subscribe({
				next: (fetchedUsers: User[]) => { // Corrected: The data is already an array of users
					// Check if there are more users than the limit
					this.hasMoreUsers.set(fetchedUsers.length > this.paginationLimit);

					// If so, slice the array to the actual limit for display
					this.users.set(fetchedUsers.slice(0, this.paginationLimit));
				},
				error: (err) => {
					console.error('Failed to fetch users:', err);
					this.users.set([]);
					this.hasMoreUsers.set(false);
				},
			});
	}

	/**
	 * Navigates to the edit user component with the user's ID.
	 */
	onEditUser(user: User): void {
		this.router.navigate(['/edit-user', user.id]);
	}

	/**
	 * Navigates to the next page of results.
	 */
	nextPage(): void {
		this.currentPageOffset.update(offset => offset + this.paginationLimit);
		this.fetchUsers();
		window.scrollTo(0, 0); // Scroll to top
	}

	/**
	 * Navigates to the previous page of results.
	 */
	previousPage(): void {
		this.currentPageOffset.update(offset => offset - this.paginationLimit);
		this.fetchUsers();
	}
}
