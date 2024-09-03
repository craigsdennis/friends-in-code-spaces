<script lang="ts">
	import SvelteMarkdown from 'svelte-markdown';

	type TopicQuestionsPromises = {
		[key: string]: Promise<string[]>;
	};

	export let data;
	let shouldEditKnowledge = false;
	let existingKnowledgePromise;
	if (data.existingKnowledge) {
		existingKnowledgePromise = Promise.resolve(data.existingKnowledge);
	} else {
		existingKnowledgePromise = generateKnowledge();
	}
	let topics: Array<string>;
	let selectedTopics: Array<string>;
	let selectedQuestions: Array<string>;
	let topicQuestionsPromises: TopicQuestionsPromises = {};

	let chosenQuestionsByTopic = data.questions.reduce((acc:any, q:any) => {
		if (acc[q.topic] === undefined) {
			acc[q.topic] = [];
		}
		acc[q.topic].push(q);
		return acc;
	}, {});

	async function generateKnowledge() {
		const response = await fetch(`/api/interviews/generate/knowledge`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: data.name,
				title: data.title,
				company: data.company
			})
		});
		const json = await response.json();
		data.existingKnowledge = json;
		// Asynchronous? Should work
		updateKnowledge().then((result) => console.log('Updated', result));
		return json;
	}

	async function generateTopics() {
		const response = await fetch(`/api/interviews/generate/topics`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				existingKnowledge: data.existingKnowledge
			})
		});
		const json = await response.json();
		topics = json as Array<string>;
	}

	async function generateQuestions() {
		// Key is topic, promise is an array of questions
		selectedTopics.forEach((topic) => {
			topicQuestionsPromises[topic] = fetch('/api/interviews/generate/questions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					existingKnowledge: data.existingKnowledge,
					topic: topic
				})
			}).then((response) => response.json());
		});
	}

	async function saveQuestions() {
		const promises = selectedQuestions.map(async (topicAndQuestion) => {
			const [topic, question] = topicAndQuestion.split('=>');
			const response = await fetch(`/api/interviews/${data.id}/questions`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					topic,
					question
				})
			});
			return response;
		});
		await Promise.all(promises).catch((err) => {
			console.error(`Oh noes: ${err}`);
		});
	}

	function toggleEditKnowledge() {
		shouldEditKnowledge = !shouldEditKnowledge;
	}

	async function updateKnowledge() {
		const response = await fetch(`/api/interviews/${data.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: data.name,
				title: data.title,
				company: data.company,
				existingKnowledge: data.existingKnowledge
			})
		});
		shouldEditKnowledge = false;
		return response;

	}
</script>

<h1>Context Window Interview for {data.name}</h1>
<section>
	<p><strong>Name</strong>: {data.name}</p>
	<p><strong>Title</strong>: {data.title}</p>
	<p><strong>Company</strong>: {data.company}</p>
</section>
{#await existingKnowledgePromise}
	<p>Searching training data...</p>
{:then existingKnowledge}
	<section>
		<h2>Existing Knowledge</h2>
		{#if shouldEditKnowledge}
			<textarea bind:value={data.existingKnowledge}></textarea>
			<button on:click={updateKnowledge}>Update</button>
		{:else}
			<div id="existingKnowledge">
				<SvelteMarkdown source={existingKnowledge} />
			</div>
			<button on:click={toggleEditKnowledge}>Edit</button>
			<button on:click={generateTopics}>Generate topics</button>
		{/if}
	</section>
{:catch err}
	<p>Oh noes: {err}</p>
{/await}
{#if data.questions && data.questions.length > 0}
	<section>
		<h2>Chosen Questions</h2>
		{#each Object.keys(chosenQuestionsByTopic) as topic}
			<details><summary>{topic}</summary>
			{#each chosenQuestionsByTopic[topic] as question}
			<p>{question.question}</p>
			{/each}
			</details>


		{/each}
	</section>
{/if}
{#if topics}
	<section>
		<h2>Generated Topics</h2>
		<ul>
			{#each topics as topic}
				<li>
					<label>
						<input
							type="checkbox"
							name="selectedTopics"
							value={topic}
							bind:group={selectedTopics}
						/>
						{topic}
					</label>
				</li>
			{/each}
		</ul>
		<button on:click={generateQuestions}>Generate Questions</button>
	</section>
{/if}

{#if Object.keys(topicQuestionsPromises).length > 0}
	<section>
		<h2>Generated Questions</h2>
		{#each Object.entries(topicQuestionsPromises) as [topic, promise]}
			<h3>{topic}</h3>
			{#await promise}
				Generating...
			{:then questions}
				<ul>
					{#each questions as question}
						<li>
							<label>
								<input
									type="checkbox"
									name="selectedQuestions"
									value={`${topic}=>${question}`}
									bind:group={selectedQuestions}
								/>
								{question}
							</label>
						</li>
					{/each}
				</ul>
			{/await}
		{/each}
	</section>
	<button on:click={saveQuestions}>Save these Questions</button>
{/if}

<style>
	h1 {
		color: #74c991;
	}

	h2 {
		color: #dcdcaa;
	}

	h3 {
		text-transform: capitalize;
	}

	summary {
		color: #74c991;
		text-transform: capitalize;
	}

	strong {
		color: #4fc1ff;
	}

	section {
		background-color: #252526;
		border: 1px solid #3c3c3c;
		padding: 10px;
		margin-top: 20px;
	}

	#existingKnowledge {
		padding: 10px;
		background-color: #2d2d2d;
		color: #ccc;
		border: 1px solid;
	}

	textarea {
		width: 100%;
		height: 100%;
		box-sizing: border-box;
	}

	button {
		background-color: #007acc;
		border: none;
		color: white;
		padding: 5px;
	}

	button:hover {
		background-color: #005a9e;
	}
</style>
