import request from 'supertest';
import { Pool } from 'pg';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { App } from 'supertest/types';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { WRITE_POOL_TOKEN } from '@/infrastructure/database/database.token';
import { FinancialModule } from '@/modules/financial/financial.module';
import { DomainErrorFilter } from '@/infrastructure/http/domain-error.filter';

describe('FinancialController — depósitos (integração)', () => {
  let app: INestApplication;
  let server: App;
  let writePool: Pool;
  let accountId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule,
        FinancialModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new DomainErrorFilter());
    await app.init();
    server = app.getHttpServer();

    writePool = new Pool({
      database: process.env.DB_NAME ?? 'mybitcoin',
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      host: process.env.DB_WRITE_HOST ?? 'localhost',
      port: Number(process.env.DB_WRITE_PORT ?? 5432),
    });

    accountId = '11111111-1111-1111-1111-111111111111';
  }, 30_000);

  afterAll(async () => {
    await writePool.query(
      `DELETE FROM ledger_entries
       WHERE transaction_id IN (SELECT id FROM transactions WHERE account_id = $1)`,
      [accountId],
    );
    await writePool.query('DELETE FROM transactions WHERE account_id = $1', [
      accountId,
    ]);
    await writePool.end();
    await app.get<Pool>(WRITE_POOL_TOKEN).end();
    await app.close();
  });

  async function insertPendingTransaction(amountSatoshi = 100_000n): Promise<{
    id: string;
  }> {
    const { rows } = await writePool.query<{ id: string }>(
      `INSERT INTO transactions (account_id, type, amount_satoshi, status)
       VALUES ($1, 'deposit', $2, 'pending')
       RETURNING id`,
      [accountId, amountSatoshi.toString()],
    );
    return rows[0];
  }

  describe('POST /financial/deposit/confirm', () => {
    it('confirma um depósito pendente e cria os lançamentos de débito e crédito no ledger', async () => {
      const transaction = await insertPendingTransaction(100_000n);

      const response = await request(server)
        .post('/financial/deposit/confirm')
        .send({ transactionId: transaction.id, confirmations: 3 })
        .expect(201);

      expect(response.body).toEqual({ status: 'confirmed' });

      const txResult = await writePool.query<{ status: string }>(
        'SELECT status FROM transactions WHERE id = $1',
        [transaction.id],
      );
      expect(txResult.rows[0].status).toBe('confirmed');

      const entries = await writePool.query<{
        type: string;
        amount_satoshi: string;
      }>(
        'SELECT type, amount_satoshi FROM ledger_entries WHERE transaction_id = $1 ORDER BY type',
        [transaction.id],
      );
      expect(entries.rows).toHaveLength(2);
      const debit = entries.rows.find((row) => row.type === 'debit');
      const credit = entries.rows.find((row) => row.type === 'credit');
      expect(debit?.amount_satoshi).toBe('100000');
      expect(credit?.amount_satoshi).toBe('100000');
    });

    it('responde 422 TRANSACTION_NOT_FOUND para uma transação inexistente', async () => {
      const response = await request(server)
        .post('/financial/deposit/confirm')
        .send({
          transactionId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
          confirmations: 3,
        })
        .expect(422);

      expect(response.body.code).toBe('TRANSACTION_NOT_FOUND');
    });

    it('responde 409 TRANSACTION_ALREADY_CONFIRMED e não duplica lançamentos ao confirmar duas vezes', async () => {
      const transaction = await insertPendingTransaction(50_000n);

      await request(server)
        .post('/financial/deposit/confirm')
        .send({ transactionId: transaction.id, confirmations: 3 })
        .expect(201);

      const response = await request(server)
        .post('/financial/deposit/confirm')
        .send({ transactionId: transaction.id, confirmations: 3 })
        .expect(409);

      expect(response.body.code).toBe('TRANSACTION_ALREADY_CONFIRMED');

      const entries = await writePool.query(
        'SELECT id FROM ledger_entries WHERE transaction_id = $1',
        [transaction.id],
      );
      expect(entries.rows).toHaveLength(2);
    });
  });
});
