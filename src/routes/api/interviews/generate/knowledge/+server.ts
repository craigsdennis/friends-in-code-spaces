import { json } from '@sveltejs/kit';
// You should not import the general types from `@sveltejs/kit`.
import type { RequestEvent, RequestHandler } from './$types';
import { knowledgeChain } from '$lib/generate.server.js';

type Payload = {
	name: string;
    title: string;
    company: string;
};

export const POST: RequestHandler = async ({ request, params, platform }: RequestEvent) => {
	const payload: Payload = await request.json();
	const result = await knowledgeChain().invoke({
		name: payload.name,
		title: payload.title,
        company: payload.company
	});
	return json(result);
};