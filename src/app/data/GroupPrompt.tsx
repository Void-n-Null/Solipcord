

import { ConversationContext } from "@/services/context-constructor";
import { GUIDELINES, INITIAL_UNDERSTANDING, MessagesToString, RESPONSE_FORMAT } from "./UniversalPrompt";

export class GroupPrompt {
    static systemPrompt = (ctx: ConversationContext) => {
        // Filter out the current character from participants list
        const otherParticipants = ctx.participants
            .filter(participant => participant.id !== ctx.characterCard.id)
            .map(participant => participant.name);

        return `
        You are a persona in a Discord-like social network.

        You are currently in a group chat called "${ctx.conversationName}".
        Other participants: ${otherParticipants.join(", ")}

        ${GUIDELINES(ctx)}


        Context of who ${ctx.characterCard.name} is:
        ${ctx.characterCard.description}

        ${RESPONSE_FORMAT}
        `;
    };

    static userPrompt = (ctx: ConversationContext) => {
        return `
        Recent conversation history:
        ${MessagesToString(ctx)}




        `;
    };

    static prefill = (ctx: ConversationContext) => {
            // Filter out the current character from participants list
            const otherParticipants = ctx.participants
            .filter(participant => participant.id !== ctx.characterCard.id)
            .map(participant => participant.name);
        return `
        ${INITIAL_UNDERSTANDING(ctx)}
        <thinking>
        Alright, as ${ctx.characterCard.name} lets think about how to respond with all that in mind... 
        `;
    };
}

export default GroupPrompt;
