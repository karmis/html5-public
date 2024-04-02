/**
 * Created by initr on 18.10.2016.
 */
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import {ValidationResult} from './validation-result';

export class EmailValidator {

  static isEmail(control: FormControl): ValidationResult {

    var EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

    if (control.value != "" && (control.value.length <= 5 || !EMAIL_REGEXP.test(control.value))) {
      return { "incorrectMailFormat": true };
    }

    return null;
  }
}
