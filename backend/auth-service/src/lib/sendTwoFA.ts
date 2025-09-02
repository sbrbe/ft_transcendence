import { Resend } from "resend";
import { deleteCode } from "./twoFactorCode.js";

if (!process.env.TRANSCENDENCE_KEY)
	throw new Error("TRANSCENDE_KEY is not set");

const resend = new Resend(process.env.TRANSCENDENCE_KEY);

export async function sendTwoFactorCode(userId: string, email: string, code: string) {
	try {
		const { data, error } = await resend.emails.send({
			from: "send@polaria.fr",
			to: [email],
			subject: "Your login verification code",
			html:`
			<p>Voici votre code 2FA :</p>
			<p style="font-size:22px;font-weight:700;letter-spacing:2px">${code}</p>
			<p>Il expire dans <b>5 minutes</b>.</p>`,
		});

		if (error) {
			console.error("Resend error object:", error);
			console.error("Resend error JSON", JSON?.stringify(error));
			deleteCode(userId);
			throw new Error(`Failed to send 2FA code : ${error.message}`);
		}
		return data;
	} catch (error) {
		console.error("Error sending 2FA code", error);
		throw error;
	}
}