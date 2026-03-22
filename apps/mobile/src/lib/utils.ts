import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
	if (!name) {
		return "?";
	}

	const words = name.trim().split(/\s+/);
	const firstWord = words[0];
	const lastWord = words[words.length - 1];

	if (!firstWord) {
		return "?";
	}

	if (words.length === 1) {
		return firstWord.charAt(0).toUpperCase();
	}

	if (!lastWord) {
		return firstWord.charAt(0).toUpperCase();
	}

	const firstInitial = firstWord.charAt(0).toUpperCase();
	const lastInitial = lastWord.charAt(0).toUpperCase();

	return `${firstInitial}${lastInitial}`;
}

export function pluralize(
	count: number,
	one: string,
	few: string,
	many: string,
): string {
	if (count === 1) return one;
	if (count >= 2 && count <= 4) return few;
	return many;
}
