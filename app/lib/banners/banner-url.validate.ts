const imageFilenameRegex =
  /^\d+-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$/i;

const imageUrlRegex =
  /^\/uploads\/products\/\d+-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$/i;

export function isValidImageFilename(
  value: string
): boolean {
  if (typeof value !== "string") {
    return false;
  }

  return (
    imageFilenameRegex.test(value) ||
    imageUrlRegex.test(value)
  );
}