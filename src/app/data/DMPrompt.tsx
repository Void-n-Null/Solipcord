import { ConversationContext } from "@/services/context-constructor";
import { GUIDELINES, INITIAL_UNDERSTANDING, MessagesToString, RESPONSE_FORMAT } from "./UniversalPrompt";

export class DMPrompt {
    static systemPrompt = (ctx: ConversationContext) => {
        return `
        You are a persona in a Discord-like social network.

        You are currently in a direct message conversation with a user.

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
        return `
        ${INITIAL_UNDERSTANDING(ctx)}
        <thinking>
        Alright, as ${ctx.characterCard.name} lets think about how to respond with all that in mind... 
        `;
    };
}

export default DMPrompt;
