-- Wipe all existing image URLs to regenerate fresh
UPDATE drafts SET imageUrl = NULL, incompleteImageUrl = NULL;
