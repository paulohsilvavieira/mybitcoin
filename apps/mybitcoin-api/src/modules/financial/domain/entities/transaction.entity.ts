import { TransactionAlreadyConfirmedError } from '@/modules/financial/domain/errors/transaction-already-confirmed.error';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export class Transaction {
  private constructor(
    readonly id: string,
    readonly accountId: string,
    readonly type: string,
    readonly amountSatoshi: bigint,
    private _status: TransactionStatus,
    readonly createdAt: Date,
  ) {}

  get status(): TransactionStatus {
    return this._status;
  }

  confirm(): void {
    if (this._status !== 'pending') {
      throw new TransactionAlreadyConfirmedError(this.id, this._status);
    }
    this._status = 'confirmed';
  }

  static create(params: {
    accountId: string;
    type: string;
    amountSatoshi: bigint;
  }): Transaction {
    return new Transaction(
      crypto.randomUUID(),
      params.accountId,
      params.type,
      params.amountSatoshi,
      'pending',
      new Date(),
    );
  }

  static reconstitute(params: {
    id: string;
    accountId: string;
    type: string;
    amountSatoshi: bigint;
    status: TransactionStatus;
    createdAt: Date;
  }): Transaction {
    return new Transaction(
      params.id,
      params.accountId,
      params.type,
      params.amountSatoshi,
      params.status,
      params.createdAt,
    );
  }
}
