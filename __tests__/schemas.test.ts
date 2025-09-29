import { trackingSchema, weightProcessSchema, idExtractionSchema } from '@/lib/validation/schemas';

describe('Validation schemas', () => {
  describe('trackingSchema', () => {
    test('valid tracking passes', () => {
      const r = trackingSchema.safeParse({ 
        challengeId: '00000000-0000-0000-0000-000000000000', 
        dayNumber: 3, 
        weight: 84.3 
      });
      expect(r.success).toBeTruthy();
    });

    test('bad dayNumber fails', () => {
      const r = trackingSchema.safeParse({ 
        challengeId: '00000000-0000-0000-0000-000000000000', 
        dayNumber: 9, 
        weight: 84.3 
      });
      expect(r.success).toBeFalsy();
    });

    test('negative weight fails', () => {
      const r = trackingSchema.safeParse({ 
        challengeId: '00000000-0000-0000-0000-000000000000', 
        dayNumber: 3, 
        weight: -5 
      });
      expect(r.success).toBeFalsy();
    });

    test('weight over 1000 fails', () => {
      const r = trackingSchema.safeParse({ 
        challengeId: '00000000-0000-0000-0000-000000000000', 
        dayNumber: 3, 
        weight: 1500 
      });
      expect(r.success).toBeFalsy();
    });
  });

  describe('weightProcessSchema', () => {
    test('valid weight process passes', () => {
      const r = weightProcessSchema.safeParse({
        imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        photoUrl: 'https://example.com/photo.jpg'
      });
      expect(r.success).toBeTruthy();
    });

    test('missing imageBase64 fails', () => {
      const r = weightProcessSchema.safeParse({
        photoUrl: 'https://example.com/photo.jpg'
      });
      expect(r.success).toBeFalsy();
    });
  });

  describe('idExtractionSchema', () => {
    test('valid national_id extraction passes', () => {
      const r = idExtractionSchema.safeParse({
        imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        idType: 'national_id'
      });
      expect(r.success).toBeTruthy();
    });

    test('valid passport extraction passes', () => {
      const r = idExtractionSchema.safeParse({
        imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        idType: 'passport'
      });
      expect(r.success).toBeTruthy();
    });

    test('invalid idType fails', () => {
      const r = idExtractionSchema.safeParse({
        imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        idType: 'drivers_license'
      });
      expect(r.success).toBeFalsy();
    });
  });
});
