import {
  generateFullToAbbrevExercise,
  generateAbbrevToFullExercise,
  generatePrefixExercise,
  generateMathExercise
} from '../exerciseGenerators.js';

describe('Exercise Generators', () => {
  describe('generateFullToAbbrevExercise', () => {
    test('should generate valid full-to-abbreviated exercises', () => {
      for (let i = 0; i < 10; i++) {
        const exercise = generateFullToAbbrevExercise();
        
        expect(exercise).toHaveProperty('question');
        expect(exercise).toHaveProperty('answer');
        expect(exercise).toHaveProperty('type', 'full-to-abbrev');
        
        // Question should contain a full IPv6 address (may be wrapped in LaTeX)
        expect(exercise.question).toMatch(/[0-9A-F:]+/);
        
        // Answer should be abbreviated form
        expect(exercise.answer).toMatch(/^[0-9A-F:]+$/);
        
        // Extract the actual IPv6 address from LaTeX formatting if present
        const addressMatch = exercise.question.match(/\\texttt\{([^}]+)\}|([0-9A-F:]+)/);
        if (addressMatch) {
          const address = addressMatch[1] || addressMatch[2];
          expect(address.split(':').length).toBe(8);
        }
      }
    });

    test('should generate different exercises on multiple calls', () => {
      const exercises = [];
      for (let i = 0; i < 5; i++) {
        exercises.push(generateFullToAbbrevExercise());
      }
      
      // Should have some variety (not all identical)
      const uniqueQuestions = new Set(exercises.map(ex => ex.question));
      expect(uniqueQuestions.size).toBeGreaterThan(1);
    });
  });

  describe('generateAbbrevToFullExercise', () => {
    test('should generate valid abbreviated-to-full exercises', () => {
      for (let i = 0; i < 10; i++) {
        const exercise = generateAbbrevToFullExercise();
        
        expect(exercise).toHaveProperty('question');
        expect(exercise).toHaveProperty('answer');
        expect(exercise).toHaveProperty('type', 'abbrev-to-full');
        
        // Question should contain abbreviated IPv6 address (may be wrapped in LaTeX)
        expect(exercise.question).toMatch(/[0-9A-F:]+/);
        
        // Answer should be full form (8 hextets, 4 chars each)
        expect(exercise.answer).toMatch(/^[0-9A-F:]+$/);
        expect(exercise.answer.split(':').length).toBe(8);
        exercise.answer.split(':').forEach(hextet => {
          expect(hextet.length).toBe(4);
          expect(hextet).toMatch(/^[0-9A-F]{4}$/);
        });
      }
    });
  });

  describe('generatePrefixExercise', () => {
    test('should generate valid prefix exercises', () => {
      for (let i = 0; i < 10; i++) {
        const exercise = generatePrefixExercise();
        
        expect(exercise).toHaveProperty('question');
        expect(exercise).toHaveProperty('answer');
        expect(exercise).toHaveProperty('type', 'prefix');
        
        // Question should contain an IPv6 address with prefix (may be wrapped in LaTeX)
        expect(exercise.question).toMatch(/[0-9A-F:]+\/\d+/);
        
        // Answer should be network address with prefix
        expect(exercise.answer).toMatch(/^[0-9A-F:]+\/\d+$/);
        
        // Extract prefix length from both question and answer
        const questionPrefixMatch = exercise.question.match(/\/(\d+)/);
        const answerPrefixMatch = exercise.answer.match(/\/(\d+)/);
        
        expect(questionPrefixMatch).not.toBeNull();
        expect(answerPrefixMatch).not.toBeNull();
        
        const questionPrefix = parseInt(questionPrefixMatch[1]);
        const answerPrefix = parseInt(answerPrefixMatch[1]);
        
        // Prefix lengths should match
        expect(questionPrefix).toBe(answerPrefix);
        
        // Prefix should be valid (0-128)
        expect(questionPrefix).toBeGreaterThanOrEqual(0);
        expect(questionPrefix).toBeLessThanOrEqual(128);
      }
    });
  });

  describe('generateMathExercise', () => {
    test('should generate valid math exercises', () => {
      for (let i = 0; i < 10; i++) {
        const exercise = generateMathExercise();
        
        expect(exercise).toHaveProperty('question');
        expect(exercise).toHaveProperty('answer');
        expect(exercise).toHaveProperty('type', 'math');
        
        // Question should contain a fraction
        expect(exercise.question).toMatch(/\\frac\{\d+\}\{4\}/);
        
        // Answer should be a number
        expect(exercise.answer).toMatch(/^\d+$/);
        
        // Extract the numerator from the question
        const match = exercise.question.match(/\\frac\{(\d+)\}\{4\}/);
        expect(match).not.toBeNull();
        
        const numerator = parseInt(match[1]);
        const expectedAnswer = Math.floor(numerator / 4);
        
        expect(parseInt(exercise.answer)).toBe(expectedAnswer);
        
        // Numerator should be a valid prefix length
        expect(numerator).toBeGreaterThanOrEqual(0);
        expect(numerator).toBeLessThanOrEqual(128);
        expect(numerator % 4).toBe(0); // Should be divisible by 4 for clean division
      }
    });

    test('should generate common prefix lengths', () => {
      const commonPrefixes = [64, 48, 32, 56, 60, 52, 44, 40, 36, 28, 24, 20, 16, 12, 8, 4];
      const generatedPrefixes = new Set();
      
      // Generate many exercises to see variety
      for (let i = 0; i < 50; i++) {
        const exercise = generateMathExercise();
        const match = exercise.question.match(/\\frac\{(\d+)\}\{4\}/);
        if (match) {
          generatedPrefixes.add(parseInt(match[1]));
        }
      }
      
      // Should generate some common prefixes
      const hasCommonPrefixes = commonPrefixes.some(prefix => 
        generatedPrefixes.has(prefix)
      );
      expect(hasCommonPrefixes).toBe(true);
    });
  });

  describe('Exercise Consistency', () => {
    test('all exercises should have required properties', () => {
      const generators = [
        generateFullToAbbrevExercise,
        generateAbbrevToFullExercise,
        generatePrefixExercise,
        generateMathExercise
      ];

      generators.forEach(generator => {
        const exercise = generator();
        
        expect(exercise).toHaveProperty('question');
        expect(exercise).toHaveProperty('answer');
        expect(exercise).toHaveProperty('type');
        
        expect(typeof exercise.question).toBe('string');
        expect(typeof exercise.answer).toBe('string');
        expect(typeof exercise.type).toBe('string');
        
        expect(exercise.question.length).toBeGreaterThan(0);
        expect(exercise.answer.length).toBeGreaterThan(0);
      });
    });
  });
});