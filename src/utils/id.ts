let counter = 0;

export function generateUniqueId(prefix = 'id'): string {
  counter += 1;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${counter}_${random}`;
}
