import { z } from 'zod';

// 7-day tracking schema
export const trackingSchema = z.object({
  challengeId: z.string().uuid(),
  dayNumber: z.number().int().min(1).max(7),
  weight: z.number().positive().max(1000),
  photoUrl: z.string().url().optional()
});

// Weight processing schema  
export const weightProcessSchema = z.object({
  imageBase64: z.string().min(1),
  photoUrl: z.string().min(1) // Can be either a URL or a storage path
});

// ID extraction schema
export const idExtractionSchema = z.object({
  imageBase64: z.string().min(1),
  idType: z.enum(['national_id', 'passport'])
});

// Generic base64 payloads (OCR etc.)
export const base64ImageSchema = z.object({
  imageBase64: z.string().min(1).optional(),
  photoUrl: z.string().url().optional()
}).refine(v => v.imageBase64 || v.photoUrl, { 
  message: 'Provide imageBase64 or photoUrl' 
});

// OCR by kind schema
export const ocrKindSchema = z.object({
  path: z.string().min(1)
});

// Upload preview schema
export const uploadPreviewSchema = z.object({
  bucket: z.string().min(1),
  path: z.string().min(1)
});
