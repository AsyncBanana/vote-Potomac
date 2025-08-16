import { Resend, type CreateEmailOptions, type CreateEmailResponse } from 'resend';
type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>

export const sendEmail = async (
	payload: AtLeast<CreateEmailOptions,'to' | 'html'| 'subject'>,
	env: ImportMetaEnv,
): Promise<CreateEmailResponse> => {
	const resend = new Resend(env.RESEND_KEY);
	// @ts-expect-error shut up typescript I know I am not typing this properly
	const res = await resend.emails.send({
		from: "Automated Jacob <jacob@votepotomac.com>",
		...payload,
	})
	return res;
};
