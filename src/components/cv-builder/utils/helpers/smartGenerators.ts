// utils/helpers/smartGenerators.ts
// ============================================
// SMART GENERATORS
// ============================================

// Generate smart project description based on project name
export const generateSmartProjectDescription = (
    projectName: string,
    tech?: string
): string => {
    const techStack = tech || 'modern technologies';
    const name = projectName.toLowerCase();

    if (name.includes('dashboard') || name.includes('analytics')) {
        return `Built real-time analytics dashboard using ${techStack}, visualizing key metrics like sales, user behavior, and inventory. Enabled data-driven decisions for 50+ clients, reducing reporting time by 80%.`;
    }

    if (name.includes('ecommerce') || name.includes('shop') || name.includes('store')) {
        return `Developed full-featured e-commerce platform using ${techStack} with payment integration (Stripe/PayPal), inventory management, and order tracking. Served 500+ daily active users with 99.9% uptime.`;
    }

    if (name.includes('api') || name.includes('backend') || name.includes('service')) {
        return `Designed and implemented RESTful API using ${techStack} with JWT authentication, rate limiting, and comprehensive documentation. Handled 10K+ requests per day with sub-100ms response time.`;
    }

    if (name.includes('ai') || name.includes('ml') || name.includes('chatbot') || name.includes('intelligence')) {
        return `Built AI-powered solution using ${techStack} with 85% accuracy. Processed 50K+ data points and delivered actionable insights.`;
    }

    if (name.includes('mobile') || name.includes('app') || name.includes('android') || name.includes('ios')) {
        return `Developed cross-platform mobile application using ${techStack} with offline support, push notifications, and real-time sync. Achieved 4.8/5 stars on app stores with 10K+ downloads.`;
    }

    if (name.includes('portfolio') || name.includes('personal') || name.includes('website')) {
        return `Created professional portfolio/website using ${techStack} with dynamic content, responsive design, and optimized performance. Achieved 95+ Lighthouse scores and 10K+ monthly visitors.`;
    }

    if (name.includes('blog') || name.includes('content') || name.includes('cms')) {
        return `Built full-featured blog/CMS platform using ${techStack} with Markdown support, SEO optimization, and comment system. Published 50+ articles with 100K+ total views.`;
    }

    if (name.includes('chat') || name.includes('messaging') || name.includes('communication')) {
        return `Developed real-time chat/messaging application using ${techStack} with WebSocket support, read receipts, and file sharing. Served 1K+ concurrent users with sub-50ms latency.`;
    }

    if (name.includes('task') || name.includes('todo') || name.includes('project management')) {
        return `Built task/project management tool using ${techStack} with team collaboration, real-time updates, and analytics dashboard. Used by 100+ teams with 95% satisfaction rate.`;
    }

    return `Built ${projectName} using ${techStack}, delivering a scalable and maintainable solution. Focused on performance optimization, clean code, and positive user experience.`;
};

// Generate smart achievement description based on achievement title
export const generateSmartAchievementDescription = (
    achievementTitle: string
): string => {
    const title = achievementTitle.toLowerCase();

    if (title.includes('award') || title.includes('winner') || title.includes('recognition')) {
        return `Received ${achievementTitle} for outstanding performance and exceptional contribution to team success. Demonstrated leadership and delivered measurable results that exceeded expectations.`;
    }

    if (title.includes('certification') || title.includes('certified') || title.includes('credential')) {
        return `Earned ${achievementTitle} certification, validating advanced expertise in the field. Demonstrated comprehensive knowledge and practical skills.`;
    }

    if (title.includes('publication') || title.includes('published') || title.includes('article') || title.includes('blog')) {
        return `Published ${achievementTitle} with 500+ views and 30+ engagements. Shared valuable insights on industry topic with the community.`;
    }

    if (title.includes('hackathon') || title.includes('competition') || title.includes('challenge')) {
        return `Won ${achievementTitle} by building an innovative solution in 24 hours. Competed against 50+ teams and secured top position.`;
    }

    if (title.includes('leadership') || title.includes('leader') || title.includes('manager') || title.includes('director')) {
        return `Led team of 8+ members to successfully deliver project 30% ahead of schedule. Maintained 95% team satisfaction and received commendation from leadership.`;
    }

    if (title.includes('speaker') || title.includes('presentation') || title.includes('keynote') || title.includes('talk')) {
        return `Delivered keynote/presentation on industry topic at 200+ attendee event. Received 4.8/5 feedback rating and multiple follow-up invitations.`;
    }

    if (title.includes('grant') || title.includes('funding') || title.includes('scholarship')) {
        return `Secured ${achievementTitle} worth 50K for research/project. Recognized for innovation and potential impact.`;
    }

    if (title.includes('open source') || title.includes('oss') || title.includes('contributor')) {
        return `Contributed to ${achievementTitle} with 20+ merged PRs and 100+ stars. Improved project documentation and fixed critical bugs.`;
    }

    return `${achievementTitle} - Achieved through dedication, excellence, and consistent performance. Delivered measurable impact and received recognition from stakeholders and leadership.`;
};