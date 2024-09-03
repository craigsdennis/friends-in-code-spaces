import { knowledgeChain } from '$lib/generate.server.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, platform }) {
	const stmt = platform?.env.DB.prepare('SELECT * from interviews WHERE id=?;');
	const result = await stmt.bind(params.interview_id).first();
	const questionsResult = await platform?.env.DB.prepare(
        'SELECT * FROM interview_questions WHERE interview_id=? ORDER BY topic;'
    )
        .bind(params.interview_id)
        .all();
	return {
		id: result.id,
		name: result.name,
		title: result.title,
		company: result.company,
		existingKnowledge: result.existing_knowledge,
		questions: questionsResult.results
	};
}
