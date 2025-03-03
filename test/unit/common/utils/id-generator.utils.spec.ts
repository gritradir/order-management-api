import { Test, TestingModule } from '@nestjs/testing';
import { IdGeneratorUtil } from '../../../../src/common/utils/id-generator.utils';

describe('IdGeneratorUtil', () => {
  let idGenerator: IdGeneratorUtil;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdGeneratorUtil],
    }).compile();

    idGenerator = module.get<IdGeneratorUtil>(IdGeneratorUtil);
  });

  describe('generateUniqueId', () => {
    it('should generate an ID in the correct format (XXX-xxxx-XXX)', () => {
      // Act
      const uniqueId = idGenerator.generateUniqueId();
      
      // Assert
      expect(uniqueId).toMatch(/^[2-9A-HJ-NP-Z]{3}-[2-9a-hj-np-z]{4}-[2-9A-HJ-NP-Z]{3}$/);
    });

    it('should generate IDs with the correct segment lengths', () => {
      // Act
      const uniqueId = idGenerator.generateUniqueId();
      const segments = uniqueId.split('-');
      
      // Assert
      expect(segments).toHaveLength(3);
      expect(segments[0]).toHaveLength(3);
      expect(segments[1]).toHaveLength(4);
      expect(segments[2]).toHaveLength(3);
    });

    it('should generate different IDs on consecutive calls', () => {
      // Act
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(idGenerator.generateUniqueId());
      }
      
      // Assert
      expect(ids.size).toBe(100); // All IDs should be unique
    });

    it('should not include easily confused characters (0, 1, O, I, l)', () => {
      // Act
      const uniqueId = idGenerator.generateUniqueId();
      
      // Assert
      expect(uniqueId).not.toMatch(/[01OIl]/);
    });

    it('should generate IDs with uppercase for first and last segments', () => {
      // Act
      const uniqueId = idGenerator.generateUniqueId();
      const segments = uniqueId.split('-');
      
      // Assert
      expect(segments[0]).toMatch(/^[2-9A-HJ-NP-Z]{3}$/);
      expect(segments[2]).toMatch(/^[2-9A-HJ-NP-Z]{3}$/);
    });

    it('should generate IDs with lowercase for middle segment', () => {
      // Act
      const uniqueId = idGenerator.generateUniqueId();
      const segments = uniqueId.split('-');
      
      // Assert
      expect(segments[1]).toMatch(/^[2-9a-hj-np-z]{4}$/);
    });
  });
});
