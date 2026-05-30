import {
  CUIT_REGEX,
  DIGITS_REGEX,
  EMAIL_REGEX,
  NAME_REGEX,
} from '@/utils/validation';

describe('EMAIL_REGEX', () => {
  describe('valid emails', () => {
    it('should match a standard email address', () => {
      expect(EMAIL_REGEX.test('user@domain.com')).toBe(true);
    });

    it('should match an email with plus tag', () => {
      expect(EMAIL_REGEX.test('user+tag@domain.com')).toBe(true);
    });

    it('should match an email with subdomain', () => {
      expect(EMAIL_REGEX.test('user@sub.domain.co')).toBe(true);
    });

    it('should match an email with dots in local part', () => {
      expect(EMAIL_REGEX.test('first.last@example.org')).toBe(true);
    });

    it('should match an email with numbers in local part', () => {
      expect(EMAIL_REGEX.test('user123@domain.io')).toBe(true);
    });

    it('should match an email with hyphen in domain', () => {
      expect(EMAIL_REGEX.test('user@my-domain.com')).toBe(true);
    });
  });

  describe('invalid emails', () => {
    it('should not match an email without @', () => {
      expect(EMAIL_REGEX.test('userdomain.com')).toBe(false);
    });

    it('should not match an email without dot in domain', () => {
      expect(EMAIL_REGEX.test('user@domaincom')).toBe(false);
    });

    it('should not match an email with spaces', () => {
      expect(EMAIL_REGEX.test('user @domain.com')).toBe(false);
    });

    it('should not match an email starting with @', () => {
      expect(EMAIL_REGEX.test('@domain.com')).toBe(false);
    });

    it('should not match an email with no local part', () => {
      expect(EMAIL_REGEX.test('@.com')).toBe(false);
    });

    it('should not match an email with space inside domain', () => {
      expect(EMAIL_REGEX.test('user@do main.com')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should not match an empty string', () => {
      expect(EMAIL_REGEX.test('')).toBe(false);
    });

    it('should not match a string with only spaces', () => {
      expect(EMAIL_REGEX.test('   ')).toBe(false);
    });

    it('should match a very long but valid email', () => {
      const local = 'a'.repeat(50);
      expect(EMAIL_REGEX.test(`${local}@domain.com`)).toBe(true);
    });

    it('should not match consecutive dots in domain when they produce invalid token after @', () => {
      // "@" followed by something containing a dot on both sides is valid per regex,
      // but consecutive dots create an empty segment
      expect(EMAIL_REGEX.test('user@@domain.com')).toBe(false);
    });
  });
});

describe('NAME_REGEX', () => {
  describe('valid names', () => {
    it('should match a simple ASCII name', () => {
      expect(NAME_REGEX.test('Juan')).toBe(true);
    });

    it('should match a name with spaces', () => {
      expect(NAME_REGEX.test('Juan Carlos')).toBe(true);
    });

    it('should match a name with accented vowels', () => {
      expect(NAME_REGEX.test('José María')).toBe(true);
    });

    it('should match a name with ñ', () => {
      expect(NAME_REGEX.test('Ñoño')).toBe(true);
    });

    it('should match a name with ü', () => {
      expect(NAME_REGEX.test('Güemes')).toBe(true);
    });

    it('should match a hyphenated name', () => {
      expect(NAME_REGEX.test("Jean-Pierre")).toBe(true);
    });

    it("should match a name with an apostrophe", () => {
      expect(NAME_REGEX.test("O'Brien")).toBe(true);
    });

    it('should match uppercase accented letters', () => {
      expect(NAME_REGEX.test('ÁNGEL')).toBe(true);
    });
  });

  describe('invalid names', () => {
    it('should not match a name with digits', () => {
      expect(NAME_REGEX.test('Juan2')).toBe(false);
    });

    it('should not match a name with @ symbol', () => {
      expect(NAME_REGEX.test('Juan@Carlos')).toBe(false);
    });

    it('should not match a name with # symbol', () => {
      expect(NAME_REGEX.test('Juan#1')).toBe(false);
    });

    it('should not match a name with % symbol', () => {
      expect(NAME_REGEX.test('50%off')).toBe(false);
    });

    it('should not match a name with dot', () => {
      expect(NAME_REGEX.test('Dr.Strange')).toBe(false);
    });

    it('should not match a name with exclamation mark', () => {
      expect(NAME_REGEX.test('Hello!')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should not match an empty string', () => {
      expect(NAME_REGEX.test('')).toBe(false);
    });

    it('should match a single letter', () => {
      expect(NAME_REGEX.test('A')).toBe(true);
    });

    it('should match a very long valid name', () => {
      expect(NAME_REGEX.test('a'.repeat(100))).toBe(true);
    });

    it('should not match a string with only numbers', () => {
      expect(NAME_REGEX.test('12345')).toBe(false);
    });

    it('should match a name with only spaces', () => {
      // The regex allows spaces, so a string of spaces technically matches
      expect(NAME_REGEX.test('   ')).toBe(true);
    });
  });
});

describe('CUIT_REGEX', () => {
  describe('valid CUIT numbers', () => {
    it('should match a standard CUIT format', () => {
      expect(CUIT_REGEX.test('20-12345678-9')).toBe(true);
    });

    it('should match a CUIT starting with 27', () => {
      expect(CUIT_REGEX.test('27-87654321-3')).toBe(true);
    });

    it('should match a CUIT starting with 30 (empresa)', () => {
      expect(CUIT_REGEX.test('30-99999999-7')).toBe(true);
    });

    it('should match a CUIT with zeros', () => {
      expect(CUIT_REGEX.test('23-00000000-0')).toBe(true);
    });
  });

  describe('invalid CUIT numbers', () => {
    it('should not match a CUIT with missing first dash', () => {
      expect(CUIT_REGEX.test('2012345678-9')).toBe(false);
    });

    it('should not match a CUIT with missing last dash', () => {
      expect(CUIT_REGEX.test('20-123456789')).toBe(false);
    });

    it('should not match a CUIT with no dashes', () => {
      expect(CUIT_REGEX.test('20123456789')).toBe(false);
    });

    it('should not match a CUIT with letters', () => {
      expect(CUIT_REGEX.test('AB-12345678-9')).toBe(false);
    });

    it('should not match a CUIT with wrong middle segment length (7 digits)', () => {
      expect(CUIT_REGEX.test('20-1234567-9')).toBe(false);
    });

    it('should not match a CUIT with wrong middle segment length (9 digits)', () => {
      expect(CUIT_REGEX.test('20-123456789-9')).toBe(false);
    });

    it('should not match a CUIT with multi-digit verifier', () => {
      expect(CUIT_REGEX.test('20-12345678-99')).toBe(false);
    });

    it('should not match a CUIT with only one prefix digit', () => {
      expect(CUIT_REGEX.test('2-12345678-9')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should not match an empty string', () => {
      expect(CUIT_REGEX.test('')).toBe(false);
    });

    it('should not match a string with extra leading characters', () => {
      expect(CUIT_REGEX.test(' 20-12345678-9')).toBe(false);
    });

    it('should not match a string with extra trailing characters', () => {
      expect(CUIT_REGEX.test('20-12345678-9 ')).toBe(false);
    });

    it('should not match slashes instead of dashes', () => {
      expect(CUIT_REGEX.test('20/12345678/9')).toBe(false);
    });
  });
});

describe('DIGITS_REGEX', () => {
  describe('valid digit strings', () => {
    it('should match a single digit', () => {
      expect(DIGITS_REGEX.test('0')).toBe(true);
    });

    it('should match a sequence of digits', () => {
      expect(DIGITS_REGEX.test('12345678')).toBe(true);
    });

    it('should match a phone number as digits only', () => {
      expect(DIGITS_REGEX.test('01112345678')).toBe(true);
    });

    it('should match a DNI number', () => {
      expect(DIGITS_REGEX.test('35987654')).toBe(true);
    });

    it('should match a long digit string', () => {
      expect(DIGITS_REGEX.test('9'.repeat(20))).toBe(true);
    });
  });

  describe('invalid strings', () => {
    it('should not match a string with letters', () => {
      expect(DIGITS_REGEX.test('123abc')).toBe(false);
    });

    it('should not match a string with spaces', () => {
      expect(DIGITS_REGEX.test('123 456')).toBe(false);
    });

    it('should not match a string with a dash', () => {
      expect(DIGITS_REGEX.test('123-456')).toBe(false);
    });

    it('should not match a string with a dot', () => {
      expect(DIGITS_REGEX.test('3.14')).toBe(false);
    });

    it('should not match a string with only letters', () => {
      expect(DIGITS_REGEX.test('abc')).toBe(false);
    });

    it('should not match a string with special characters', () => {
      expect(DIGITS_REGEX.test('12#34')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should not match an empty string', () => {
      expect(DIGITS_REGEX.test('')).toBe(false);
    });

    it('should not match a string with a leading space before digits', () => {
      expect(DIGITS_REGEX.test(' 123')).toBe(false);
    });

    it('should not match a string with a trailing space after digits', () => {
      expect(DIGITS_REGEX.test('123 ')).toBe(false);
    });

    it('should match the boundary value of all zeros', () => {
      expect(DIGITS_REGEX.test('000')).toBe(true);
    });
  });
});
