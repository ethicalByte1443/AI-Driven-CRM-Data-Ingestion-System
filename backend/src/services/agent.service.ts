import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ExtendedCRMRecord } from '../types/crm.types';
import { env } from '../config/env';

// Determine if we should use Mock AI (if API key is missing or env sets provider to mock)
const isMockMode = !env.GEMINI_API_KEY || env.AI_PROVIDER === 'mock';

// Define the state schema using Annotation.Root
const AgentState = Annotation.Root({
  lead: Annotation<ExtendedCRMRecord>(),
  analyzedContext: Annotation<string>(),
  emailDraft: Annotation<string>(),
  emailSubject: Annotation<string>(),
  qaFeedback: Annotation<string>(),
  retryCount: Annotation<number>(),
  approved: Annotation<boolean>(),
});

// Define type of State
type StateType = typeof AgentState.State;

// Initialize the Chat Model if not in mock mode
const model = !isMockMode
  ? new ChatGoogleGenerativeAI({
      apiKey: env.GEMINI_API_KEY,
      model: env.GEMINI_MODEL,
      temperature: 0.3,
    })
  : null;

/**
 * Node 1: Analyze Lead
 */
async function analyzeLeadNode(state: StateType): Promise<Partial<StateType>> {
  const { lead } = state;
  console.log(`[Agent-Node] Analyzing lead: ${lead.name} (${lead.company || 'Individual'})`);

  if (isMockMode || !model) {
    // Generate helpful mock analysis
    const category = lead.data_source || 'general';
    return {
      analyzedContext: `Lead operates in the ${category} category. Target audience: B2B buyers. Challenge: Inefficient followups and manual lead tracking. Needs automated pipeline management.`,
    };
  }

  try {
    const prompt = `Analyze the following CRM lead to infer their target audience, business model, and two primary operational challenges:
Name: ${lead.name}
Company: ${lead.company || 'Not Specified'}
Campaign Source: ${lead.data_source || 'Unknown'}
CRM Note: ${lead.crm_note || 'None'}
Description: ${lead.description || 'None'}

Provide a brief 3-sentence summary of your analysis. Do not include headers.`;

    const response = await model.invoke([new HumanMessage(prompt)]);
    return {
      analyzedContext: response.content as string,
    };
  } catch (err) {
    console.error('[Agent-Node] Analyze Lead Node failed, using fallback:', err);
    return {
      analyzedContext: `Failed to analyze lead dynamically. Category: ${lead.data_source || 'general'}. Challenge: Manual lead management.`,
    };
  }
}

/**
 * Helper: Retrieve matching contextual guide based on Lead campaign source
 */
function retrieveCategoryKnowledge(dataSource: string): string {
  const ds = dataSource.toLowerCase();
  if (ds.includes('sarjapur') || ds.includes('plots') || ds.includes('tower') || ds.includes('park')) {
    return 'GrowEasy CRM features for Real Estate: Includes instant SMS/WhatsApp automated triggers for walk-in leads, site visit scheduling logs, automated map sharing, and property matching notifications.';
  }
  if (ds.includes('demand') || ds.includes('campaign') || ds.includes('ad')) {
    return 'GrowEasy CRM features for Marketing: Includes Google Ads and Facebook Lead Form instant integration, sub-5-second auto-responder, UTM tag tracking, and ROI attribution dashboards.';
  }
  return 'GrowEasy CRM features for B2B: Includes clean Zod CSV data upload, duplication filters, lead pipeline boards, automated email drafts, and round-robin owner assignments.';
}

/**
 * Node 2: Email Copywriter
 */
async function draftEmailNode(state: StateType): Promise<Partial<StateType>> {
  const { lead, analyzedContext, qaFeedback, retryCount = 0 } = state;
  console.log(`[Agent-Node] Drafting email for lead: ${lead.name} (Attempt ${retryCount + 1})`);

  const retrievedKnowledge = retrieveCategoryKnowledge(lead.data_source || '');

  if (isMockMode || !model) {
    // Return standard mock draft
    const subject = `Boost your sales follow-ups at ${lead.company || 'your company'} with GrowEasy CRM`;
    const body = `Hi ${lead.name},

I noticed you recently engaged with us through our ${lead.data_source || 'marketing campaign'}. Based on our analysis, managing client follow-ups efficiently is key for your B2B model.

At GrowEasy, we help teams automate lead mapping, tracking, and communication. We've compiled some real-estate and lead-routing features that match your profile.

Would you be open to a brief 5-minute call next week to see how this fits your workflow?

Best regards,
Abhraneel Dhar
Product Lead, GrowEasy CRM

--
To opt-out of onboarding communications, reply with UNSUBSCRIBE.`;

    return {
      emailSubject: subject,
      emailDraft: body,
      retryCount: retryCount + 1,
    };
  }

  try {
    let prompt = `You are a professional B2B onboarding Copywriter at GrowEasy CRM. Write a friendly, personalized outreach email.
Lead Name: ${lead.name}
Company Name: ${lead.company || 'your company'}
Campaign Source: ${lead.data_source || 'GrowEasy Portal'}
Lead Analysis: ${analyzedContext}
CRM Reference Context: ${retrievedKnowledge}

Requirements:
1. Begin with a subject line starting with "Subject: "
2. Begin the email body starting with "Body: "
3. Address the lead by their first name in the greeting.
4. Set the sender name as "Abhraneel Dhar, Product Lead at GrowEasy".
5. Must NOT contain any bracketed draft placeholders like "[Your Name]" or "[Insert Date]".
6. Must include an unsubscribe footer notice at the very bottom.
7. Keep it concise (under 150 words).`;

    if (qaFeedback) {
      prompt += `\n\nCRITICAL: Your previous draft was REJECTED by QA for the following issues:\n${qaFeedback}\n\nPlease revise the email completely to fix these issues.`;
    }

    const response = await model.invoke([new HumanMessage(prompt)]);
    const content = response.content as string;

    // Parse Subject and Body
    let subject = `Introduction to GrowEasy CRM`;
    let body = content;

    const subjectMatch = content.match(/Subject:\s*(.*)/i);
    const bodyMatch = content.match(/Body:\s*([\s\S]*)/i);

    if (subjectMatch) {
      subject = subjectMatch[1].trim();
    }
    if (bodyMatch) {
      body = bodyMatch[1].trim();
    } else {
      // Clean prefix "Subject:" and "Body:" manually if regex fails
      body = content.replace(/Subject:.*\n?/i, '').replace(/Body:\s*/i, '').trim();
    }

    return {
      emailSubject: subject,
      emailDraft: body,
      retryCount: retryCount + 1,
    };
  } catch (err) {
    console.error('[Agent-Node] Copywriter Node failed, using fallback:', err);
    return {
      emailSubject: `Welcome to GrowEasy CRM, ${lead.name}`,
      emailDraft: `Hi ${lead.name},\n\nWelcome to GrowEasy CRM! We have received your lead info from the ${lead.data_source || 'import list'}.\n\nBest regards,\nAbhraneel Dhar`,
      retryCount: retryCount + 1,
    };
  }
}

/**
 * Node 3: Compliance & QA Evaluator
 */
async function qaCheckNode(state: StateType): Promise<Partial<StateType>> {
  const { lead, emailSubject, emailDraft } = state;
  console.log(`[Agent-Node] Reviewing email draft for lead: ${lead.name}`);

  if (isMockMode || !model) {
    return {
      approved: true,
      qaFeedback: '',
    };
  }

  try {
    const prompt = `You are a compliance reviewer. Check if the draft email violates any rules:
Draft Subject: ${emailSubject}
Draft Body: ${emailDraft}
Lead Name: ${lead.name}

Rules:
1. Must not contain bracket placeholders (like "[", "]", "Insert").
2. Must address the lead by name in the greeting.
3. Must contain an unsubscribe or opt-out notice at the bottom.
4. Tone must not be aggressive, pushy, or spammy.

Output EXACTLY in this format:
Approved: [Yes/No]
Feedback: [If Approved is No, list exact reasons. If Approved is Yes, leave this line empty]`;

    const response = await model.invoke([new HumanMessage(prompt)]);
    const content = response.content as string;

    const approvedMatch = content.match(/Approved:\s*(Yes|No)/i);
    const feedbackMatch = content.match(/Feedback:\s*(.*)/is);

    const isApproved = approvedMatch ? approvedMatch[1].toLowerCase() === 'yes' : true;
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : '';

    console.log(`[Agent-Node] QA Approval Status: ${isApproved ? 'APPROVED' : 'REJECTED'}`);
    if (!isApproved) {
      console.log(`[Agent-Node] QA Feedback: ${feedback}`);
    }

    return {
      approved: isApproved,
      qaFeedback: isApproved ? '' : feedback,
    };
  } catch (err) {
    console.error('[Agent-Node] QA Node failed, automatically passing:', err);
    return {
      approved: true,
      qaFeedback: '',
    };
  }
}

// Build workflow graph
const workflow = new StateGraph(AgentState)
  .addNode('analyze', analyzeLeadNode)
  .addNode('draft', draftEmailNode)
  .addNode('qa', qaCheckNode);

// Define edges
workflow.addEdge(START, 'analyze');
workflow.addEdge('analyze', 'draft');
workflow.addEdge('draft', 'qa');

// QA Router
workflow.addConditionalEdges(
  'qa',
  (state: StateType) => {
    if (state.approved || (state.retryCount && state.retryCount >= 3)) {
      return 'end';
    }
    return 'draft';
  },
  {
    draft: 'draft',
    end: END,
  }
);

// Compile Graph
const compiledGraph = workflow.compile();

export interface WorkflowResult {
  success: boolean;
  emailSubject?: string;
  emailDraft?: string;
  error?: string;
}

/**
 * Main service function to execute the LangGraph agentic workflow
 */
export async function runEngagementWorkflow(lead: ExtendedCRMRecord): Promise<WorkflowResult> {
  try {
    const initialState = {
      lead,
      analyzedContext: '',
      emailDraft: '',
      emailSubject: '',
      qaFeedback: '',
      retryCount: 0,
      approved: false,
    };

    const finalState = await compiledGraph.invoke(initialState);

    if (finalState.approved) {
      return {
        success: true,
        emailSubject: finalState.emailSubject,
        emailDraft: finalState.emailDraft,
      };
    } else {
      return {
        success: false,
        error: `Agent failed to draft a compliant email: ${finalState.qaFeedback || 'Failed QA check limit.'}`,
      };
    }
  } catch (error) {
    console.error('[AgentWorkflow] Execution error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown workflow execution error',
    };
  }
}
