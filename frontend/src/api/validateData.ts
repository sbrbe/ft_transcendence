export const reName = /^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u;

export const reUsername = /^(?![._-])(?!.*[._-]$)(?!.*(?:\.\.|__))\p{L}[\p{L}\p{M}0-9._-]{2,19}$/u;

export const casing = (s: string) =>
		 s ? s.charAt(0).toLocaleUpperCase('fr-FR') + s.slice(1).toLocaleLowerCase('fr-FR') : s;

export type RegisterFields = {
		firstName: string;
		lastName: string;
		username: string;
};

export type ValidationResult = {
		ok: boolean;
		errors: Partial<Record<keyof RegisterFields, string>>;
		cleaned: RegisterFields;
};

export function clean(str: string): string {
		return str
			.normalize('NFKC')
			.replace(/\u200B|\u200C|\u200D|\uFEFF/g, '')
			.replace(/\u2019/g, "'")
			.trim();
}

export function validateName(field: string, value: string): string | null {
		const cleaned = clean(value);
//		if (!cleaned) {
//			return (`Field ${field} is required`);
//		}
//		if (cleaned.length < 1) {
//			return (`${field} invalid`);
//		}
		if (cleaned.length >= 50) {
			return (`${field} invalid`);
		}
		if (!reName.test(cleaned)) {
			return (`${field} invalid`);
		}
		return null;
	}

export function validateUsername(value: string): string | null {
		const cleaned = clean(value);
//		if (!cleaned) {
//			return ('Username required');
//		}
		if (!reUsername.test(cleaned)) {
			return ('Username invalid');
		}
		return null;
	}

export function validateRegister(fields: RegisterFields): ValidationResult {
		const cleaned: RegisterFields = {
			firstName: clean(fields.firstName),
			lastName: clean(fields.lastName),
			username: clean(fields.username),
		};

		const errors: ValidationResult['errors'] = {};

		const error1 = validateName('First Name', cleaned.firstName);
		if (error1){
			errors.firstName = error1;
		}
		const error2 = validateName('Last Name', cleaned.lastName);
		if (error2) {
			errors.lastName = error2;
		}
		const error3 = validateUsername(cleaned.username);
		if (error3) {
			errors.username = error3;
		}

		return { ok: Object.keys(errors).length === 0, errors, cleaned };
	}