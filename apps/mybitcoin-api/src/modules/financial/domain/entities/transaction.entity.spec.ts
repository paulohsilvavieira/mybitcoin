import { Transaction } from '@/modules/financial/domain/entities/transaction.entity';
import { TransactionAlreadyConfirmedError } from '@/modules/financial/domain/errors/transaction-already-confirmed.error';

describe('Transaction', () => {
  function buildPendingTransaction(): Transaction {
    return Transaction.create({
      accountId: 'user-1',
      type: 'deposit',
      amountSatoshi: 100_000n,
    });
  }

  describe('confirm', () => {
    it('moves a pending transaction to confirmed', () => {
      const transaction = buildPendingTransaction();

      transaction.confirm();

      expect(transaction.status).toBe('confirmed');
    });

    it('throws TransactionAlreadyConfirmedError when confirming an already confirmed transaction', () => {
      const transaction = buildPendingTransaction();
      transaction.confirm();

      expect(() => transaction.confirm()).toThrow(
        TransactionAlreadyConfirmedError,
      );
      expect(transaction.status).toBe('confirmed');
    });
  });
});
