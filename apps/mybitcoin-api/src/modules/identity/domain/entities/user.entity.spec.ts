import { User } from '@/modules/identity/domain/entities/user.entity';
import { Email } from '@/modules/identity/domain/value-objects/email.vo';
import { TermsNotAcceptedError } from '@/modules/identity/domain/errors/terms-not-accepted.error';

describe('User', () => {
  describe('create', () => {
    const validParams = {
      name: 'John Doe',
      email: Email.create('john@example.com'),
      passwordHash: '$2b$12$hashedpassword',
      termsAccepted: true,
      registrationIp: '127.0.0.1',
    };

    it('cria usuário com status PENDING_EMAIL_VERIFICATION e emailVerified false', () => {
      const user = User.create(validParams);
      expect(user.status.isPendingEmailVerification()).toBe(true);
      expect(user.status.isActive()).toBe(false);
      expect(user.emailVerified).toBe(false);
    });

    it('lança TermsNotAcceptedError quando termsAccepted é false', () => {
      expect(() =>
        User.create({ ...validParams, termsAccepted: false }),
      ).toThrow(TermsNotAcceptedError);
    });
  });

  describe('verifyEmail', () => {
    it('muda status para ACTIVE', () => {
      const user = User.create({
        name: 'John Doe',
        email: Email.create('john@example.com'),
        passwordHash: '$2b$12$hashedpassword',
        termsAccepted: true,
        registrationIp: '127.0.0.1',
      });

      user.verifyEmail();

      expect(user.status.isActive()).toBe(true);
      expect(user.emailVerified).toBe(true);
    });
  });
});
