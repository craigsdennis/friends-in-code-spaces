import { json } from '@sveltejs/kit';

// You should not import the general types from `@sveltejs/kit`.
import type { RequestEvent, RequestHandler } from './$types';

type Payload = {
	question: string;
	topic: string;
};

export const GET: RequestHandler = async ({ request, params, platform }: RequestEvent) => {
    const result = await platform?.env.DB.prepare(
        'SELECT * FROM interview_questions WHERE interview_id=? ORDER BY topic;'
    )
        .bind(params.interview_id)
        .all();
    return json(result);
};

export const POST: RequestHandler = async ({ request, params, platform }: RequestEvent) => {
	const payload: Payload = await request.json();
    console.log("payload", payload);
    const result = await platform?.env.DB.prepare(
        'INSERT into interview_questions (interview_id, topic, question) VALUES (?, ?, ?);'
    )
        .bind(params.interview_id, payload.topic, payload.question)
        .run();
    // TODO: Return the ID?
    console.log("result", result);
	return json(result);
};