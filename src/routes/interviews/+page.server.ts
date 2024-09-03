/** @type {import('./$types').PageServerLoad} */
export async function load({ platform }) {
	const stmt = platform?.env.DB.prepare('SELECT * from interviews;');
	const { results } = await stmt.all();
	return {
		interviews: results
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, platform }) => {
		const data = await request.formData();
		await platform?.env.DB.prepare(
			'INSERT into interviews (name, company, title) VALUES (?, ?, ?);'
		)
			.bind(data.get('name'), data.get('company'), data.get('title'))
			.run();
	}
};
