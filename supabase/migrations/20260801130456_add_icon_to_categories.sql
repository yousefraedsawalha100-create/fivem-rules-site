/*
# Add icon column to categories table

The original site's categories table has an `icon` column for storing the
lucide icon name. Our initial migration was missing it.

1. Modified Tables
- `categories` — added `icon` (text, default 'Scale')
*/

ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT 'Scale';
