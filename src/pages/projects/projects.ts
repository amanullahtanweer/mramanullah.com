import { getRepositoryDetails } from '../../utils';

export interface Project {
	name: string;
	demoLink: string;
	tags?: string[];
	description?: string;
	postLink?: string;
	demoLinkRel?: string;
	[key: string]: any;
}

export const projects: Project[] = [
	{
		name: 'BuyDID Portal',
		description: 'VoIP DID Number with SIP Trunking',
		demoLink: 'https://portal.buydid.net',
		tags: ['Ruby on Rails', 'Asterisk']
	},
	{
		name: 'Peoplefirst Creator Portal',
		description: 'Helping creators and influencers to monetize their content',
		demoLink: 'http://creators.peoplefirst.cc/',
		demoLinkRel: 'nofollow noopener noreferrer',
		tags: ['NextJS', 'React']
	},
	{
		name: 'Freelancers Union',
		description: 'Non-profit organization serving as a support system for independent workers through advocacy.',
		demoLink: 'https://freelancersunion.org',
		demoLinkRel: 'nofollow noopener noreferrer',
		tags: ['WordPress']
	},
	{
		name: 'Data Scrubbing Portal',
		description:
			'Scrub DNC allows you to scrub DNC list files against your Lead list files to determine which phone numbers exist on the Do Not Call list.',
		demoLink: 'https://blocks.scrublists.com/',
		demoLinkRel: 'nofollow noopener noreferrer',
		tags: ['Ruby on Rails', 'Tailwind', 'Redis']
	},
	{
		...(await getRepositoryDetails('amanullahtanweer/imgur')),
		name: 'Imgur',
		demoLink: 'https://github.com/amanullahtanweer/imgur',
		tags: ['GoLang', 'Javascript']
	}
];
