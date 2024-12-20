import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsTransactionHashConstraint
  implements ValidatorConstraintInterface
{
  validate(hash: string): boolean {
    // Ethereum transaction hashes are 66 characters long and start with '0x'
    const isValid = /^0x([A-Fa-f0-9]{64})$/.test(hash);
    return isValid;
  }

  defaultMessage(): string {
    return 'Invalid hash, it must be a valid 66-character hexadecimal string starting with 0x.';
  }
}

export function IsHash(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTransactionHashConstraint,
    });
  };
}
