import { DomainError } from '@/shared/domain.error';
import { TransactionStatus } from '@/modules/financial/domain/entities/transaction.entity';

export class TransactionAlreadyConfirmedError extends DomainError {
  readonly code = 'TRANSACTION_ALREADY_CONFIRMED';

  constructor(
    readonly transactionId: string,
    readonly currentStatus: TransactionStatus,
  ) {
    super(
      `Cannot confirm transaction '${transactionId}' in status '${currentStatus}'`,
    );
  }
}
