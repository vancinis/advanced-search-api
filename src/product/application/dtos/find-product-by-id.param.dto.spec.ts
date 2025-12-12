import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FindProductByIdParamDto } from './find-product-by-id.param.dto';

describe('FindProductByIdParamDto', () => {
  describe('UUID validation', () => {
    it('should accept valid UUID v4', async () => {
      const dto = plainToInstance(FindProductByIdParamDto, {
        id: '550e8400-e29b-41d4-a716-446655440000',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept another valid UUID v4', async () => {
      const dto = plainToInstance(FindProductByIdParamDto, {
        id: '123e4567-e89b-42d3-a456-426614174000',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should reject invalid UUID format', async () => {
      const dto = plainToInstance(FindProductByIdParamDto, {
        id: 'not-a-valid-uuid',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((e) => e.property === 'id');
      expect(idError).toBeDefined();
      expect(idError?.constraints?.isUuid).toContain('valid UUID');
    });

    it('should reject UUID with wrong format (missing dashes)', async () => {
      const dto = plainToInstance(FindProductByIdParamDto, {
        id: '550e8400e29b41d4a716446655440000',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((e) => e.property === 'id');
      expect(idError).toBeDefined();
    });

    it('should reject UUID with invalid characters', async () => {
      const dto = plainToInstance(FindProductByIdParamDto, {
        id: '550e8400-e29b-41d4-a716-44665544000g',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((e) => e.property === 'id');
      expect(idError).toBeDefined();
    });

    it('should reject empty string', async () => {
      const dto = plainToInstance(FindProductByIdParamDto, {
        id: '',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((e) => e.property === 'id');
      expect(idError).toBeDefined();
    });

    it('should reject string with only spaces', async () => {
      const dto = plainToInstance(FindProductByIdParamDto, {
        id: '   ',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((e) => e.property === 'id');
      expect(idError).toBeDefined();
    });

    it('should reject UUID v1 format (only accepts v4)', async () => {
      const dto = plainToInstance(FindProductByIdParamDto, {
        id: '550e8400-e29b-11d4-a716-446655440000', // UUID v1
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject too short UUID', async () => {
      const dto = plainToInstance(FindProductByIdParamDto, {
        id: '550e8400-e29b-41d4',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((e) => e.property === 'id');
      expect(idError).toBeDefined();
    });

    it('should reject too long UUID', async () => {
      const dto = plainToInstance(FindProductByIdParamDto, {
        id: '550e8400-e29b-41d4-a716-446655440000-extra',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((e) => e.property === 'id');
      expect(idError).toBeDefined();
    });

    it('should reject numeric ID', async () => {
      const dto = plainToInstance(FindProductByIdParamDto, {
        id: '12345',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((e) => e.property === 'id');
      expect(idError).toBeDefined();
    });

    it('should reject null value', async () => {
      const dto = plainToInstance(FindProductByIdParamDto, {
        id: null,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((e) => e.property === 'id');
      expect(idError).toBeDefined();
    });

    it('should reject undefined value', async () => {
      const dto = plainToInstance(FindProductByIdParamDto, {
        id: undefined,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((e) => e.property === 'id');
      expect(idError).toBeDefined();
    });

    it('should accept UUID with uppercase letters', async () => {
      const dto = plainToInstance(FindProductByIdParamDto, {
        id: '550E8400-E29B-41D4-A716-446655440000',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept UUID with mixed case letters', async () => {
      const dto = plainToInstance(FindProductByIdParamDto, {
        id: '550e8400-E29B-41d4-A716-446655440000',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should reject SQL injection attempt', async () => {
      const dto = plainToInstance(FindProductByIdParamDto, {
        id: "'; DROP TABLE products; --",
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((e) => e.property === 'id');
      expect(idError).toBeDefined();
    });

    it('should reject XSS attempt', async () => {
      const dto = plainToInstance(FindProductByIdParamDto, {
        id: '<script>alert("xss")</script>',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((e) => e.property === 'id');
      expect(idError).toBeDefined();
    });
  });
});

