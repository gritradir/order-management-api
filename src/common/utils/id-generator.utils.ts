import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';

export interface IIdGenerator {
  generateUniqueId(): string;
}

@Injectable()
export class IdGeneratorUtil implements IIdGenerator {
  private readonly upperAlphabet: string = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  private readonly lowerAlphabet: string = '23456789abcdefghijkmnpqrstuvwxyz';
  private readonly upperGenerator: (size?: number) => string;
  private readonly mixedGenerator: (size?: number) => string;
  
  constructor() {
    // Create generators with custom alphabets
    this.upperGenerator = customAlphabet(this.upperAlphabet, 3);
    this.mixedGenerator = customAlphabet(this.lowerAlphabet, 4);
  }

  /**
   * Generates a unique, human-readable ID that is not easily guessable
   * Format: 3 uppercase alphanumeric chars + hyphen + 4 mixed case alphanumeric chars + hyphen + 3 uppercase alphanumeric chars
   * e.g., ABC-1234-XYZ
   * 
   * @returns {string} A unique ID string
   */
  public generateUniqueId(): string {
    const segments = [
      this.upperGenerator(),
      this.mixedGenerator(),
      this.upperGenerator(),
    ];

    return segments.join('-');
  }
}
