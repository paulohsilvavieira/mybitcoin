import { Session } from '@/modules/identity/domain/entities/session.entity';

describe('Session', () => {
  const validParams = {
    userId: 'user-1',
    tokenHash: 'a'.repeat(64),
    deviceInfo: 'Chrome on Linux',
    ipAddress: '127.0.0.1',
  };

  describe('create', () => {
    it('cria sessão ativa, não revogada, com expiresAt 24h após createdAt', () => {
      const session = Session.create(validParams);
      expect(session.revokedAt).toBeNull();
      expect(session.isActive()).toBe(true);
      const diffMs = session.expiresAt.getTime() - session.createdAt.getTime();
      expect(diffMs).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe('isActive', () => {
    it('retorna false quando a sessão foi revogada', () => {
      const session = Session.create(validParams);
      session.revoke();
      expect(session.isActive()).toBe(false);
    });

    it('retorna false quando passou do teto absoluto de 24h', () => {
      const session = Session.create(validParams);
      const after25h = new Date(
        session.createdAt.getTime() + 25 * 60 * 60 * 1000,
      );
      expect(session.isActive(after25h)).toBe(false);
    });

    it('retorna false quando ficou inativa por mais de 30 minutos (idle)', () => {
      const session = Session.create(validParams);
      const after31min = new Date(
        session.lastActivityAt.getTime() + 31 * 60 * 1000,
      );
      expect(session.isActive(after31min)).toBe(false);
    });

    it('retorna true dentro do teto absoluto e do idle timeout', () => {
      const session = Session.create(validParams);
      const after10min = new Date(
        session.lastActivityAt.getTime() + 10 * 60 * 1000,
      );
      expect(session.isActive(after10min)).toBe(true);
    });
  });

  describe('revoke', () => {
    it('marca revokedAt', () => {
      const session = Session.create(validParams);
      session.revoke();
      expect(session.revokedAt).not.toBeNull();
    });

    it('é idempotente — revogar duas vezes não lança erro nem muda o revokedAt original', () => {
      const session = Session.create(validParams);
      session.revoke();
      const firstRevokedAt = session.revokedAt;
      session.revoke();
      expect(session.revokedAt).toBe(firstRevokedAt);
    });
  });

  describe('touch', () => {
    it('atualiza lastActivityAt', () => {
      const session = Session.create(validParams);
      const later = new Date(session.lastActivityAt.getTime() + 60_000);
      session.touch(later);
      expect(session.lastActivityAt).toBe(later);
    });

    it('não altera expiresAt', () => {
      const session = Session.create(validParams);
      const originalExpiresAt = session.expiresAt;
      session.touch(new Date(session.lastActivityAt.getTime() + 60_000));
      expect(session.expiresAt).toBe(originalExpiresAt);
    });
  });
});
