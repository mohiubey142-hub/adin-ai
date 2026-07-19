import { SeniorityLevel } from '../seniorityDetector';

export const getLawBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `⚖️ Assisted senior attorneys on complex cases, learning that law isn't just about rules — it's about people. Every file represents someone's real stakes.`,
            `📝 Drafted legal documents and developed eye for detail that borders on obsessive. One typo can change everything — learned to love the precision.`,
            `🤝 Conducted client interviews and realized being a good lawyer starts with being a good listener. People don't just need representation — they need to feel heard.`,
            `📚 Researched case law for hours, discovering that best arguments are built on tiny details. Like a detective, but with footnotes.`,
            `🏛️ Attended court proceedings and learned that justice, for all its formality, is still made by humans. Watching skilled lawyers work was seeing art in motion.`
        ];
    }
    if (level === 'mid') {
        return [
            `⚖️ Managed 30+ active cases independently, learning that organization isn't boring — it's freedom. Knowing where everything is lets you focus on clients.`,
            `📝 Negotiated settlements that saved clients $2M+ and discovered that best deal is where everyone walks away feeling respected.`,
            `🤝 Represented clients in court and found my voice — literally and figuratively. First time I heard "counselor" from a judge, I knew I was home.`,
            `👩‍⚖️ Mentored junior associates and watched them find their own voices. Teaching someone to think like a lawyer is harder than learning it yourself — and more rewarding.`,
            `📚 Developed case strategies for complex litigation, learning that best ideas come from quiet moments of reflection.`
        ];
    }
    if (level === 'senior') {
        return [
            `⚖️ Led legal department, managing 15+ attorneys and support staff. Built team culture where compassion and competence are equally valued.`,
            `🏛️ Argued precedent-setting cases that shaped legal interpretations. Standing before the judge, I remembered every mentor who believed in me.`,
            `🤝 Established pro bono program providing 5,000+ hours of free legal services to underserved communities. Justice shouldn't depend on your bank account.`,
            `📝 Served as legal advisor to executive leadership on multimillion-dollar decisions. My job wasn't to say "no" — it was to find the "yes" that wouldn't come back to haunt us.`,
            `👩‍⚖️ Mentored dozens of young lawyers, many now leading their own practices. Best case I ever won was helping someone else find their path.`
        ];
    }
    return [
        `🏆 Led legal department, managing 50+ attorneys and $10M+ budget. My proudest achievement was the inclusive culture we built.`,
        `⚖️ Argued landmark cases that changed legal landscape. The real win was seeing our arguments become precedent that helped future clients.`,
        `🤝 Established legal aid clinic providing 50,000+ hours of free services to those who couldn't afford representation. Justice for all, not just those who can pay.`,
        `🌍 Represented Pakistan in international legal forums, bringing our perspective to global conversations about justice.`,
        `💙 Mentored legal leaders who now run their own firms and clinics. My legacy is the lawyers I helped become advocates for change.`
    ];
};