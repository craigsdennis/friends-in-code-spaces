import { json } from '@sveltejs/kit';
import { knowledgeChain } from '$lib/generate.server.js';

// You should not import the general types from `@sveltejs/kit`.
import type { RequestEvent, RequestHandler } from './$types';

type Payload = {
	name: string;
	title: string;
	company: string;
	existingKnowledge: string;
};

export const PUT: RequestHandler = async ({ request, params, platform }: RequestEvent) => {
	const payload: Payload = await request.json();

	console.log('Updating existing knowledge');
	const update = platform?.env.DB.prepare(
		'UPDATE interviews SET name=?, title=?, company=?, existing_knowledge=? WHERE id=?;'
	);
	// TODO: Does update return the row?
	const result = await update
		.bind(
			payload.name,
			payload.title,
			payload.company,
			payload.existingKnowledge,
			params.interview_id
		)
		.run();

	return json(result);
};
