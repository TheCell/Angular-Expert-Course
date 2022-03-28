import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from './services/employee.service';
import { EmployeeValidators } from './validators/employee.validator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(private fb: FormBuilder,
    private employeeService: EmployeeService) {}

  form = this.fb.group(
    {
      firstname: [
        '',
        {
          validators: Validators.required,
          updateOn: 'blur',
        },
      ],
      lastname: ['', Validators.required],
      email: [
        '',
        [Validators.required, EmployeeValidators.emailValidator],
        EmployeeValidators.checkEmailUnique(this.employeeService),
      ],
      emailConfirm: [
        '',
        [Validators.required, EmployeeValidators.emailValidator],
      ],
      rating: [],
    },
    {
      validators: EmployeeValidators.checkEmailsMatch,
      updateOn: 'blur',
    }
  );

  get firstname() {
    return this.form.get('firstname');
  }
  get lastname() {
    return this.form.get('lastname');
  }
  get email() {
    return this.form.get('email');
  }
  get emailConfirm() {
    return this.form.get('emailConfirm');
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      console.log('Submitting form values: ', this.form.getRawValue());
    } else {
      console.error('Form is invalid. Cannot submit...');
    }
  }
}
