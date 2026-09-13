import cookieParser from 'cookie-parser';
import request from 'supertest';
import { Pool } from 'pg';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { App } from 'supertest/types';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import {
  READ_POOL_TOKEN,
  WRITE_POOL_TOKEN,
} from '@/infrastructure/database/database.token';
import { IdentityModule } from '@/modules/identity/identity.module';
import { DomainErrorFilter } from '@/infrastructure/http/domain-error.filter';
import {
  SESSION_COOKIE_NAME,
  CSRF_COOKIE_NAME,
} from '@/modules/identity/presentation/session-cookies';

const PASSWORD = 'Str0ng!Pass';

interface ParsedCookies {
  session?: string;
  csrf?: string;
  raw: string[];
}

function parseSetCookie(header: string[] | undefined): ParsedCookies {
  const raw = header ?? [];
  const read = (name: string): string | undefined => {
    const entry = raw.find((cookie) => cookie.startsWith(`${name}=`));
    if (!entry) return undefined;
    const value = entry.split(';')[0].slice(name.length + 1);
    return value === '' ? undefined : value;
  };
  return {
    session: read(SESSION_COOKIE_NAME),
    csrf: read(CSRF_COOKIE_NAME),
    raw,
  };
}

describe('SessionsController — sessões (integração)', () => {
  let app: INestApplication;
  let server: App;
  let writePool: Pool;
  let readPool: Pool;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule,
        IdentityModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalFilters(new DomainErrorFilter());
    await app.init();
    server = app.getHttpServer();

    const poolConfig = {
      database: process.env.DB_NAME ?? 'mybitcoin',
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
    };
    writePool = new Pool({
      ...poolConfig,
      host: process.env.DB_WRITE_HOST ?? 'localhost',
      port: Number(process.env.DB_WRITE_PORT ?? 5432),
    });
    readPool = new Pool({
      ...poolConfig,
      host: process.env.DB_READ_HOST ?? 'localhost',
      port: Number(process.env.DB_READ_PORT ?? 5432),
    });
  }, 30_000);

  afterAll(async () => {
    await writePool.end();
    await readPool.end();
    await app.get<Pool>(WRITE_POOL_TOKEN).end();
    await app.get<Pool>(READ_POOL_TOKEN).end();
    await app.close();
  });

  async function waitForReplica(id: string): Promise<void> {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const { rowCount } = await readPool.query(
        'SELECT 1 FROM users WHERE id = $1',
        [id],
      );
      if (rowCount === 1) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Usuário ${id} não replicou para a réplica a tempo`);
  }

  async function registerAndLogin(): Promise<{
    userId: string;
    email: string;
    cookies: ParsedCookies;
  }> {
    const registerEmail = `sessions-controller-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}@example.com`;
    const registerResponse = await request(server)
      .post('/auth/register')
      .send({
        name: 'Katherine Johnson',
        email: registerEmail,
        password: PASSWORD,
        termsAccepted: true,
      })
      .expect(201);
    const registeredUserId = registerResponse.body.userId as string;
    await waitForReplica(registeredUserId);

    const loginResponse = await request(server)
      .post('/auth/login')
      .send({ email: registerEmail, password: PASSWORD })
      .expect(200);
    const cookies = parseSetCookie(
      loginResponse.headers['set-cookie'] as unknown as string[],
    );

    return { userId: registeredUserId, email: registerEmail, cookies };
  }

  function cookieHeader(cookies: ParsedCookies): string {
    return `${SESSION_COOKIE_NAME}=${cookies.session}; ${CSRF_COOKIE_NAME}=${cookies.csrf}`;
  }

  async function cleanup(userId: string, email: string): Promise<void> {
    await writePool.query('DELETE FROM sessions WHERE user_id = $1', [
      userId,
    ]);
    await writePool.query('DELETE FROM users WHERE id = $1', [userId]);
    await writePool.query('DELETE FROM login_attempts WHERE email = $1', [
      email,
    ]);
  }

  describe('GET /sessions', () => {
    it('lista apenas as sessões ativas do usuário autenticado', async () => {
      const { userId, email, cookies } = await registerAndLogin();
      try {
        const response = await request(server)
          .get('/sessions')
          .set('Cookie', cookieHeader(cookies))
          .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].id).toBeDefined();
        expect(response.body[0].deviceInfo).toBeDefined();
      } finally {
        await cleanup(userId, email);
      }
    });

    it('não lista sessões revogadas', async () => {
      const { userId, email, cookies } = await registerAndLogin();
      try {
        await request(server)
          .post('/auth/logout')
          .set('Cookie', cookieHeader(cookies))
          .expect(204);

        const secondLogin = await request(server)
          .post('/auth/login')
          .send({ email, password: PASSWORD })
          .expect(200);
        const secondCookies = parseSetCookie(
          secondLogin.headers['set-cookie'] as unknown as string[],
        );

        const response = await request(server)
          .get('/sessions')
          .set('Cookie', cookieHeader(secondCookies))
          .expect(200);

        expect(response.body).toHaveLength(1);
      } finally {
        await cleanup(userId, email);
      }
    });

    it('responde 401 sem cookie de sessão', async () => {
      await request(server).get('/sessions').expect(401);
    });

    it('não retorna sessões de outro usuário', async () => {
      const userA = await registerAndLogin();
      const userB = await registerAndLogin();
      try {
        const response = await request(server)
          .get('/sessions')
          .set('Cookie', cookieHeader(userA.cookies))
          .expect(200);

        const returnedIds = response.body.map(
          (s: { id: string }) => s.id,
        ) as string[];

        const { rows } = await writePool.query<{ id: string }>(
          'SELECT id FROM sessions WHERE user_id = $1',
          [userB.userId],
        );
        const userBSessionIds = rows.map((r) => r.id);

        expect(
          returnedIds.some((id) => userBSessionIds.includes(id)),
        ).toBe(false);
      } finally {
        await cleanup(userA.userId, userA.email);
        await cleanup(userB.userId, userB.email);
      }
    });
  });

  describe('DELETE /sessions/:id', () => {
    it('revoga a própria sessão informando o CSRF token', async () => {
      const { userId, email, cookies } = await registerAndLogin();
      try {
        const listResponse = await request(server)
          .get('/sessions')
          .set('Cookie', cookieHeader(cookies))
          .expect(200);
        const sessionId = listResponse.body[0].id as string;

        await request(server)
          .delete(`/sessions/${sessionId}`)
          .set('Cookie', cookieHeader(cookies))
          .set('X-CSRF-Token', cookies.csrf!)
          .expect(204);

        const { rows } = await writePool.query<{ revoked_at: Date | null }>(
          'SELECT revoked_at FROM sessions WHERE id = $1',
          [sessionId],
        );
        expect(rows[0].revoked_at).not.toBeNull();
      } finally {
        await cleanup(userId, email);
      }
    });

    it('responde 403 quando o header X-CSRF-Token não bate com o cookie', async () => {
      const { userId, email, cookies } = await registerAndLogin();
      try {
        const listResponse = await request(server)
          .get('/sessions')
          .set('Cookie', cookieHeader(cookies))
          .expect(200);
        const sessionId = listResponse.body[0].id as string;

        await request(server)
          .delete(`/sessions/${sessionId}`)
          .set('Cookie', cookieHeader(cookies))
          .set('X-CSRF-Token', 'wrong-csrf-token')
          .expect(403);
      } finally {
        await cleanup(userId, email);
      }
    });

    it('responde 404 SESSION_NOT_FOUND ao tentar revogar sessão de outro usuário', async () => {
      const userA = await registerAndLogin();
      const userB = await registerAndLogin();
      try {
        const listResponseB = await request(server)
          .get('/sessions')
          .set('Cookie', cookieHeader(userB.cookies))
          .expect(200);
        const userBSessionId = listResponseB.body[0].id as string;

        const response = await request(server)
          .delete(`/sessions/${userBSessionId}`)
          .set('Cookie', cookieHeader(userA.cookies))
          .set('X-CSRF-Token', userA.cookies.csrf!)
          .expect(404);

        expect(response.body.code).toBe('SESSION_NOT_FOUND');

        const { rows } = await writePool.query<{ revoked_at: Date | null }>(
          'SELECT revoked_at FROM sessions WHERE id = $1',
          [userBSessionId],
        );
        expect(rows[0].revoked_at).toBeNull();
      } finally {
        await cleanup(userA.userId, userA.email);
        await cleanup(userB.userId, userB.email);
      }
    });

    it('responde 409 SESSION_ALREADY_REVOKED ao revogar a mesma sessão duas vezes', async () => {
      const { userId, email, cookies } = await registerAndLogin();
      try {
        const listResponse = await request(server)
          .get('/sessions')
          .set('Cookie', cookieHeader(cookies))
          .expect(200);
        const sessionId = listResponse.body[0].id as string;

        await request(server)
          .delete(`/sessions/${sessionId}`)
          .set('Cookie', cookieHeader(cookies))
          .set('X-CSRF-Token', cookies.csrf!)
          .expect(204);

        const secondLogin = await request(server)
          .post('/auth/login')
          .send({ email, password: PASSWORD })
          .expect(200);
        const secondCookies = parseSetCookie(
          secondLogin.headers['set-cookie'] as unknown as string[],
        );

        const response = await request(server)
          .delete(`/sessions/${sessionId}`)
          .set('Cookie', cookieHeader(secondCookies))
          .set('X-CSRF-Token', secondCookies.csrf!)
          .expect(409);

        expect(response.body.code).toBe('SESSION_ALREADY_REVOKED');
      } finally {
        await cleanup(userId, email);
      }
    });

    it('responde 404 SESSION_NOT_FOUND para um id de sessão inexistente', async () => {
      const { userId, email, cookies } = await registerAndLogin();
      try {
        const response = await request(server)
          .delete('/sessions/00000000-0000-0000-0000-000000000000')
          .set('Cookie', cookieHeader(cookies))
          .set('X-CSRF-Token', cookies.csrf!)
          .expect(404);

        expect(response.body.code).toBe('SESSION_NOT_FOUND');
      } finally {
        await cleanup(userId, email);
      }
    });

    it('responde 401 sem cookie de sessão', async () => {
      await request(server)
        .delete('/sessions/00000000-0000-0000-0000-000000000000')
        .expect(401);
    });
  });
});
