const Blueprints = {
    Billing: [
        "Verify customer subscription status",
        "Check recent payment logs in Stripe",
        "Request screenshot of the error if applicable",
        "Escalate to Accounts if refund requested"
    ],
    Technical: [
        "Check server logs for error trace",
        "Identify which API version is being used",
        "Try to reproduce on staging environment",
        "Tag as 'BUG' if reproduced"
    ],
    Security: [
        "Audit recent login attempts",
        "Check if 2FA is enabled for the account",
        "Verify ownership via identity challenge",
        "Force logout all sessions if suspicious"
    ],
    General: [
        "Acknowledge the ticket within 2 hours",
        "Ask for more details if the description is vague",
        "Search KB for similar issues"
    ]
};

const ResponseTemplates = {
    Billing: [
        { title: "Refund Policy", text: "Hello, our refund policy covers requests made within 30 days. Let me check your eligibility." },
        { title: "Payment Failed", text: "It seems your recent payment failed. Please check your card details or contact your bank." }
    ],
    Technical: [
        { title: "Bug Acknowledged", text: "We've confirmed this is a bug and our engineers are working on a fix." },
        { title: "Log Request", text: "Could you please provide the server logs or the exact error message you received?" }
    ],
    Security: [
        { title: "Password Reset", text: "For security reasons, please reset your password using the link sent to your email." },
        { title: "Account Freeze", text: "We have temporarily frozen your account as a precaution due to suspicious activity." }
    ],
    General: [
        { title: "Initial Greet", text: "Thank you for reaching out! We've received your ticket and are looking into it." }
    ]
};

module.exports = { Blueprints, ResponseTemplates };
