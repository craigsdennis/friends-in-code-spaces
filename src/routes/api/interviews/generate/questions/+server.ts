import { json } from '@sveltejs/kit';
// You should not import the general types from `@sveltejs/kit`.
import type { RequestEvent, RequestHandler } from './$types';
import { questionsChain } from '$lib/generate.server.js';

type Payload = {
	existingKnowledge: string;
	topic: string;
};

export const POST: RequestHandler = async ({ request, params, platform }: RequestEvent) => {
	const payload: Payload = await request.json();
	const result = await questionsChain().invoke({
		existingKnowledge: payload.existingKnowledge,
		topic: payload.topic
	});
	return json(result);
};