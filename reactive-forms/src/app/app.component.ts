import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { FormFieldConfig } from './models/form-field-config.model';
import { FormFieldType } from './models/form-field-types.enum';
import { EmployeeService } from './services/employee.service';
import { EmployeeValidators } from './validators/employee.validator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {

  dynamicFields?: FormFieldConfig[];
  isLoading = false;
  formFieldTypes = FormFieldType;
  currentUserRole: 'user' | 'admin' = 'user';

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
      addresses: this.fb.array([])
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

  get addresses() {
    return this.form.get('addresses') as FormArray;;
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      console.log('Submitting form values: ', this.form.getRawValue());
    } else {
      console.error('Form is invalid. Cannot submit...');
    }
  }

  changeUserRole() {
    const newRole = this.currentUserRole === 'user' ? 'admin' : 'user';
    this.currentUserRole = newRole;
    this.setDynamicForm(newRole);
  }

  newAddress(): FormGroup {
    return this.fb.group({
      street: '',
      city: '',
    });
  }

  addAddress() {
    const emptyAddress = this.newAddress();
    this.addresses.push(emptyAddress);
  }

  removeAddress(index: number) {
    this.addresses.removeAt(index);
  }

  private setDynamicForm(userType: 'user' | 'admin') {
    this.isLoading = true;
    this.form.removeControl('dynamicForm');
    this.employeeService
      .getDynamicFormFields(userType)
      .pipe(
        catchError(() => {
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe((configs) => {
        this.isLoading = false;
        if (configs.length < 1) {
          return;
        }
        this.dynamicFields = configs;

        const formControls: { [key: string]: FormControl } = {};
        configs.forEach((config: FormFieldConfig) => {
          formControls[config.fieldId] = new FormControl(
            {
              value: this.setFieldValue(config.value, config.type),
              disabled: config.disabled || false,
            },
            {
              validators: config.required ? Validators.required : null,
            }
          );
        });
        const dynamicForm = this.fb.group(formControls);
        this.form.addControl('dynamicForm', dynamicForm);
      });
  }

  private setFieldValue(
    value: string | number | boolean | undefined,
    type: FormFieldType): string | boolean | number {
    switch (type) {
      case FormFieldType.text:
        return value ?? '';

      case FormFieldType.checkbox:
        return value ?? false;

      default:
        return '';
    }
  }
}
