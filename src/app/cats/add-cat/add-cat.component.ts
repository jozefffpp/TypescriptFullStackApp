import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { CatsFacade } from "../+state/cats/cats.facade";

@Component({
	selector: 'add-cat',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
	template: `
		<div class="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light py-5">
			<div class="card p-4 p-md-5 shadow-lg rounded-3 border-0" style="max-width: 500px; width: 100%;">
				<div class="card-body">
					<h2 class="card-title text-center fw-bold mb-4">Add a New Cat</h2>

					<form [formGroup]="form" (ngSubmit)="handleSubmit()">
						<div class="mb-3">
							<label for="title" class="form-label fw-bold">Cat Name</label>
							<input id="title" type="text" formControlName="title"
								   class="form-control rounded-pill"
								   placeholder="e.g., Whiskers, Mittens">
							<p *ngIf="form.get('title')?.invalid && form.get('title')?.touched"
							   class="text-danger mt-1 fs-6">Name is required.</p>
						</div>

						<div class="mb-3">
							<label class="form-label fw-bold">Images</label>
							<div class="position-relative">
								<!-- The 'multiple' attribute allows selecting more than one file -->
								<input type="file" (change)="handleFileChange($event)" accept="image/*" multiple
									   class="form-control h-100 position-absolute top-0 start-0 opacity-0 cursor-pointer">
								<div
									class="d-flex justify-content-center align-items-center w-100 border border-dashed border-2 rounded-3 text-secondary p-5 bg-light">
									<span>Click to select images (up to 3)</span>
								</div>
							</div>

							<!-- Display error message if more than 3 files are selected -->
							<p *ngIf="fileCount() > 3" class="text-danger mt-2 fs-6">
								You can only upload up to 3 images at once.
							</p>

							<!-- Display error message if the total file size exceeds the limit -->
							<p *ngIf="fileSizeExceeded()" class="text-danger mt-2 fs-6">
								The total size of the selected files exceeds 10MB.
							</p>

							<!-- Display multiple image previews -->
							<div *ngIf="imageUrls().length > 0" class="mt-4 row g-2">
								@for(url of imageUrls(); track url) {
									<div class="col-4">
										<img [src]="url" class="img-fluid rounded-3 shadow-sm" alt="Selected cat preview">
									</div>
								}
							</div>
						</div>

						<div *ngIf="message()"
							 class="alert text-center fw-bold"
							 [class.alert-success]="message().includes('Goodie Doggy')"
							 [class.alert-danger]="!message().includes('Goodie Doggy')">
							{{ message() }}
						</div>

						<div class="d-grid gap-2">
							<button type="submit"
									[disabled]="loading() || form.invalid || fileToUpload.length === 0 || fileSizeExceeded()"
									class="btn btn-primary btn-lg rounded-pill"
									[class.disabled]="loading() || form.invalid || fileToUpload.length === 0 || fileSizeExceeded()">
								<span *ngIf="!loading()">Upload Cat{{ fileToUpload.length > 1 ? 's' : '' }}</span>
								<span *ngIf="loading()">Uploading...</span>
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>`,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCatComponent {

	public fileToUpload: File[] = [];

	// Use signals for state management
	message = signal<string>('');
	loading = signal<boolean>(false);
	imageUrls = signal<string[]>([]);
	fileCount = signal<number>(0);
	fileSizeExceeded = signal<boolean>(false);

	constructor(private fb: FormBuilder, private catsFacade: CatsFacade) { }

	// Create a reactive form group
	form = this.fb.group({
		title: ['', Validators.required],
	});

	// Handles the file input change event
	handleFileChange(event: Event) {
		const element = event.currentTarget as HTMLInputElement;
		const fileList: FileList | null = element.files;

		this.fileToUpload = [];
		this.imageUrls.set([]);
		this.fileCount.set(0);
		this.fileSizeExceeded.set(false);

		if (fileList && fileList.length > 0) {
			this.fileCount.set(fileList.length);

			// Calculate total size of all selected files
			const totalSize = Array.from(fileList).reduce((sum, file) => sum + file.size, 0);
			const maxSizeBytes = 10 * 1024 * 1024; // 10MB

			if (totalSize > maxSizeBytes) {
				this.fileSizeExceeded.set(true);
				return;
			}

			// Limit the files to 3
			const files = Array.from(fileList).slice(0, 3);
			this.fileToUpload = files;
			this.imageUrls.set(files.map(file => URL.createObjectURL(file)));
		}
	}

	// Handles the form submission
	handleSubmit() {
		this.message.set('');

		if (this.form.invalid || this.fileToUpload.length === 0 || this.fileSizeExceeded()) {
			this.message.set('Please select at least one image and provide a name.');
			return;
		}

		this.loading.set(true);

		const formData = new FormData();
		formData.append('title', this.form.value.title as string);

		// Loop through files and append them all with the same key 'image'
		this.fileToUpload.forEach(file => {
			formData.append('image', file, file.name);
		});

		this.catsFacade.addCat$(formData).pipe(
			finalize(() => this.loading.set(false))
		).subscribe({
			next: () => {
				this.message.set('Goodie Doggy, Uploaded');
				this.form.reset();
				this.fileToUpload = [];
				this.imageUrls.set([]);
				this.fileCount.set(0);
				this.fileSizeExceeded.set(false);
			},
			error: (err) => {
				console.error('Upload error:', err);
				this.message.set('Ah, error occurred during upload. Please try again.');
			}
		});
	}
}
