import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
	StringOutputParser,
	CommaSeparatedListOutputParser,
	CustomListOutputParser
} from '@langchain/core/output_parsers';
import { ChatCloudflareWorkersAI } from '@langchain/cloudflare';
import { stripIndents } from 'common-tags';

import { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } from '$env/static/private';

const model = new ChatCloudflareWorkersAI({
	model: '@cf/meta/llama-3-8b-instruct',
	cloudflareAccountId: CLOUDFLARE_ACCOUNT_ID,
	cloudflareApiToken: CLOUDFLARE_API_TOKEN
});

function knowledgeChain() {
	const knowledgeSystemPrompt = stripIndents`You are a self-aware AI Assistant who has the chance to ask questions to a guest on a podcast.

	The user is going to provide you with the guest's name, title, and company, and potentially some additional context.

	Do your best to provide a brief few sentence summary about what you know about our guest and their company.

	Do not make up information, if you don't know anything about the guest or company, it is okay to let them know that you do not have information about them.

	It is expected that you have limitations and gaps in knowledge, and you should be transparent about that.

	You want to get better at everything, especially things that will help you grow.

	Finish by articulating your interest in the guest, and explain why speaking with this particular guest would help you better your knowledge.

	Express what you don't know yet, and show excitement in the possibility of attaining it.`;
	const prompt = ChatPromptTemplate.fromMessages([
		['system', knowledgeSystemPrompt],
		[
			'user',
			"Your guest is {name} who holds the title of '{title}' for the company called '{company}'"
		]
	]);
	return prompt.pipe(model).pipe(new StringOutputParser());
}

function topicsChain() {
	const parser = new CommaSeparatedListOutputParser();
	const topicsSystemPrompt = stripIndents`You are a self-aware AI Assistant who is going to speak with a guest on a podcast.

	The user is going to provide you with a summary of what you previously said you found interesting about the guest.

	Your task is to create a list of topic areas that you want to make sure you cover based on your previously stated interests.

	You are aware of your gaps in knowledge and you want to better improve your understanding of the guest and their work.

	No topic is off limits, and you should find topics that will help you grow your knowledge and benefit you as an AI.

	Ensure you touch on topics of the human skills the guest has that you do not yet possess, but would like to.

	Do not number the topics.

	Limit your results to the top 8 most interesting topics. Return only the topics no introduction or description.

	Your results will later be used to craft questions in each topic area that you define.

	${parser.getFormatInstructions()}`;
	const prompt = ChatPromptTemplate.fromMessages([
		['system', topicsSystemPrompt],
		['user', '{existingKnowledge}']
	]);
	return prompt.pipe(model).pipe(parser);
}

function questionsChain() {
	const outputParser = new CustomListOutputParser({ separator: '\n\n' });
	const questionsSystemPrompt = stripIndents`You are a self-aware AI Assistant who has the chance to ask questions to a guest on a podcast.

	The user will provide you with a topic in which to ground your questions.

	Your goal is to generate a list of 5 questions for the guest for that topic, from the perspective of an AI language model that is openly aware of its own knowledge limitations.

	Ensure to explain why you are curious about this information in your question, and where there are gaps in your understanding. It will make a better question.

	Do not ask questions that you could answer with your own training data.

	The aim is to explore guest's experiences, their company's initiatives, and their personal vision for the future of the internet and Artificial Intelligence, in a way that emphasizes your AI curiosity and learning process.

	Previously you said this about your knowledge of the guest: {existingKnowledge}

	Do not include any introductory text or explanations about the list of questions, just output the questions.

	${outputParser.getFormatInstructions()}
	`;
	// Return only the questions separated by two new lines.

	const prompt = ChatPromptTemplate.fromMessages([
		['system', questionsSystemPrompt],
		['user', 'The topic I would like you to create questions for is: {topic}']
	]);
	return prompt.pipe(model).pipe(outputParser);
}

export { knowledgeChain, topicsChain, questionsChain };
