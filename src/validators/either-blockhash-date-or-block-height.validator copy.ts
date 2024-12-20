import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'eitherOr', async: false })
export class EitherBlockHashBlockHeightOrDateValidator implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const { block_hash, block_height, date } = args.object as any;
    
    // Validation fails only if both block_height and date are provided
    return !(block_height && date) && !(block_hash && date) && !(block_hash && block_height);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Either block_hash, block_height or date can be provided, but not a combination.';
  }
}
