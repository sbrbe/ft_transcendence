export const reName = /^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u;

export const reUsername = /^[\p{L}\p{M}]{2,20}$/u;

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
		if (!cleaned) {
			return (`Field ${field} is required`);
		}
		if (cleaned.length < 1) {
			return (`${field} must have 2 characters minimum`);
		}
		if (cleaned.length >= 50) {
			return (`${field} must have 50 characters maximum`);
		}
		if (!reName.test(cleaned)) {
			return (`${field} can contain only letters, spaces or '-'`);
		}
		return null;
	}

export function validateUsername(value: string): string | null {
		const cleaned = clean(value);
		if (!cleaned) {
			return ('Username required');
		}
		if (!reUsername.test(cleaned)) {
			return ('The username can contain only letters, have a length between 2 and 20 characters and no spaces');
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

		const error1 = validateName('firstName', cleaned.firstName);
		if (error1){
			errors.firstName = error1;
		}
		const error2 = validateName('lastName', cleaned.lastName);
		if (error2) {
			errors.lastName = error2;
		}
		const error3 = validateUsername(cleaned.username);
		if (error3) {
			errors.username = error3;
		}

		return { ok: Object.keys(errors).length === 0, errors, cleaned };
	}