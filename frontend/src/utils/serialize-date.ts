export const serializeDate = (date: Date): string => date.toISOString();

export const deserializeDate = (dateString: string): Date => new Date(dateString);
