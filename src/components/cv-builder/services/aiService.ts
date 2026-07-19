export const enhanceProfessional = (text: string): string => {
    return text
        .replace(/I'm/g, 'I am')
        .replace(/I've/g, 'I have')
        .replace(/I'd/g, 'I would')
        .replace(/thrilled/g, 'enthusiastic')
        .replace(/excited/g, 'interested')
        .replace(/super/g, 'very')
        .replace(/really/g, 'truly')
        .replace(/great/g, 'excellent')
        .replace(/good/g, 'strong');
};

export const enhancePersuasive = (text: string): string => {
    return text
        .replace(/I have experience in/g, 'I bring proven expertise in')
        .replace(/I am skilled in/g, 'I excel at')
        .replace(/I can/g, 'I am capable of')
        .replace(/I want/g, 'I am committed to')
        .replace(/I think/g, 'I am confident that')
        .replace(/My skills include/g, 'My core strengths include');
};

export const enhanceATS = (text: string): string => {
    return text
        .replace(/I have experience in/g, 'Demonstrated expertise in')
        .replace(/My skills include/g, 'Core competencies include')
        .replace(/I have worked on/g, 'Successfully delivered')
        .replace(/I am good at/g, 'Excel at')
        .replace(/I know/g, 'Proficient in')
        .replace(/I can/g, 'Able to');
};

export const enhanceFormal = (text: string): string => {
    return text
        .replace(/I'm/g, 'I am')
        .replace(/I've/g, 'I have')
        .replace(/I'd/g, 'I would')
        .replace(/can't/g, 'cannot')
        .replace(/won't/g, 'will not')
        .replace(/don't/g, 'do not')
        .replace(/shouldn't/g, 'should not');
};

export const enhanceHuman = (text: string): string => {
    return text
        .replace(/I have experience in/g, 'I have had the privilege of working in')
        .replace(/My skills include/g, 'What I truly enjoy is')
        .replace(/I am skilled in/g, 'I am passionate about')
        .replace(/I can/g, 'I love to')
        .replace(/I want/g, 'I am eager to')
        .replace(/I think/g, 'I believe');
};

export const enhanceShorten = (text: string): string => {
    let shortened = text;
    const unnecessaryPhrases = [
        'I am writing to', 'I would like to', 'I want to', 
        'I think that', 'I believe that', 'In my opinion'
    ];
    for (const phrase of unnecessaryPhrases) {
        shortened = shortened.replace(new RegExp(phrase, 'gi'), '');
    }
    const words = shortened.split(' ');
    if (words.length > 30) {
        shortened = words.slice(0, 30).join(' ') + '...';
    }
    return shortened.replace(/\s+/g, ' ').trim();
};

export const enhanceClosing = (text: string): string => {
    let enhanced = text;
    if (!enhanced.includes('contribute to your organization')) {
        enhanced = enhanced + ' I am confident that I can make a meaningful contribution to your organization.';
    }
    return enhanced;
};

export const enhanceGrammar = (text: string): string => {
    return text
        .replace(/\s+/g, ' ')
        .replace(/ ,/g, ',')
        .replace(/ \./g, '.')
        .replace(/I have a degree in/g, 'I hold a degree in')
        .replace(/a experience/g, 'an experience')
        .replace(/a honor/g, 'an honor')
        .replace(/a MBA/g, 'an MBA')
        .trim();
};

export const applyEnhancement = (text: string, type: string): string => {
    switch(type) {
        case 'professional': return enhanceProfessional(text);
        case 'persuasive': return enhancePersuasive(text);
        case 'ats': return enhanceATS(text);
        case 'formal': return enhanceFormal(text);
        case 'human': return enhanceHuman(text);
        case 'shorten': return enhanceShorten(text);
        case 'closing': return enhanceClosing(text);
        case 'grammar': return enhanceGrammar(text);
        default: return text;
    }
};

export const getEnhancerLabel = (type: string): string => {
    const labels: Record<string, string> = {
        professional: 'Professional Tone',
        persuasive: 'More Persuasive',
        ats: 'ATS Optimized',
        formal: 'More Formal',
        human: 'More Human',
        shorten: 'Shorten Content',
        closing: 'Stronger Closing',
        grammar: 'Fix Grammar'
    };
    return labels[type] || type;
};