import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ReactiveFormsModule, FormBuilder} from '@angular/forms';
import {NgClass, NgIf} from '@angular/common';
import { UsersApiService } from '../users-api.service';
import {finalize} from "rxjs/operators";
import {catchError, EMPTY, Subject, switchMap, takeUntil} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {UpdateUserPayload} from "../users.model";
@Component({
  selector: 'app-edit-user',
	imports: [
		NgClass,
		ReactiveFormsModule,
		NgIf
	],
	standalone: true,
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent implements OnInit, OnDestroy {
	private usersService = inject(UsersApiService);
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private fb = inject(FormBuilder);
	// Subject to manage subscriptions and prevent memory leaks
	private destroy$ = new Subject<void>();

	// All fields optional
	public userForm = this.fb.group({
		name: [''],
		email: [''],
		timezone_id: [null],
		country_id: [null],
	});

	public message = signal<string | null>(null);
	public isSuccess = signal(false);
	public loading = signal(true);
	public userId!: string;

	ngOnInit(): void {
		this.route.paramMap.pipe(
			// Use takeUntil to automatically unsubscribe when the component is destroyed
			takeUntil(this.destroy$),
			switchMap(params => {
				const id = params.get('id');
				if (!id) {
					this.message.set('No user ID provided in the route.');
					this.isSuccess.set(false);
					this.loading.set(false);
					return EMPTY;
				}
				this.userId = id;
				this.loading.set(true);
				return this.usersService.getUserById$(this.userId);
			}),
			catchError(err => {
				this.message.set(`Error fetching user: ${err.message || 'Unknown error'}`);
				this.isSuccess.set(false);
				this.loading.set(false);
				return EMPTY;
			})
		).subscribe({
			next: (user) => {
				if (user) {
					this.userForm.patchValue(user as any);
				} else {
					this.message.set(`User with ID "${this.userId}" not found.`);
					this.isSuccess.set(false);
				}
				this.loading.set(false);
			},
		});
	}

	// Lifecycle hook to clean up subscriptions
	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	public onSubmit(): void {
		if (!this.userId) {
			this.message.set('Please provide a valid user ID.');
			this.isSuccess.set(false);
			return;
		}

		// Filter out properties with null or empty values
		const payload: UpdateUserPayload = {};
		const formValue = this.userForm.value as any;

		for (const key of Object.keys(formValue)) {
			if (formValue[key] !== null && formValue[key] !== '') {
				payload[key as keyof UpdateUserPayload] = formValue[key];
			}
		}

		this.loading.set(true);
		this.usersService.updateUser(this.userId, payload).pipe(
			finalize(() => {
				this.loading.set(false);
			}),
			catchError(err => {
				this.message.set(`Error updating user: ${err.message || 'Unknown error'}`);
				this.isSuccess.set(false);
				return EMPTY;
			})
		).subscribe({
			next: () => {
				this.message.set(`User updated successfully!`);
				this.isSuccess.set(true);
				// Reset the form after successful submission
				this.userForm.reset();
			}
		});
	}

	public goBack(): void {
		this.router.navigate(['/users']);
	}
}
