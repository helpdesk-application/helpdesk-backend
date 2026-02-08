const sentimentKeywords = {
    positive: ['great', 'excellent', 'happy', 'solved', 'thanks', 'wonderful', 'fast'],
    negative: ['broken', 'fail', 'error', 'slow', 'frustrated', 'terrible', 'bad', 'issue'],
    urgent: ['asap', 'urgent', 'immediately', 'critical', 'emergency', 'blocked']
};

const categoryKeywords = {
    Billing: ['invoice', 'charge', 'payment', 'refund', 'price', 'billing', 'subscription'],
    Technical: ['bug', 'crash', 'code', 'api', 'server', 'integration', 'error', 'performance'],
    Security: ['login', 'password', 'access', 'hack', 'auth', 'security', 'permission'],
    General: []
};

exports.analyzeTicket = (text) => {
    const content = text.toLowerCase();

    // 1. Sentiment Score
    let sentimentScore = 0;
    sentimentKeywords.positive.forEach(word => { if (content.includes(word)) sentimentScore++; });
    sentimentKeywords.negative.forEach(word => { if (content.includes(word)) sentimentScore--; });

    let sentiment = 'Neutral';
    if (sentimentScore > 0) sentiment = 'Positive';
    if (sentimentScore < 0) sentiment = 'Negative';

    // 2. Auto-Priority
    let suggestedPriority = null;
    if (sentimentKeywords.urgent.some(word => content.includes(word))) {
        suggestedPriority = 'HIGH';
    }

    // 3. Auto-Category
    let suggestedCategory = 'General';
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(word => content.includes(word))) {
            suggestedCategory = cat;
            break;
        }
    }

    return { sentiment, suggestedPriority, suggestedCategory };
};
