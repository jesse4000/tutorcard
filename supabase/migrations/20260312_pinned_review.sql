-- Add is_pinned column to reviews table for tutor-controlled featured review
ALTER TABLE reviews ADD COLUMN is_pinned boolean NOT NULL DEFAULT false;
