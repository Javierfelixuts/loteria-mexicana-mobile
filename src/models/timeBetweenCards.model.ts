export const VALID_NUMBERS_BETWEEN_CARDS = [1,2,3,4,5] as const;

export type TTimeBetweenCards = typeof VALID_NUMBERS_BETWEEN_CARDS[number];
