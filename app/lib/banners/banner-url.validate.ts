const imageFilenameRegex =
  /^\d+-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/i;

const imageUrlRegex =
  /^\/?api\/uploads\/products\/\d+-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/i;

export function isValidImageFilename(
  value: string
): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const normalizedValue = value.trim();

  return (
    imageFilenameRegex.test(normalizedValue) ||
    imageUrlRegex.test(normalizedValue)
  );
}