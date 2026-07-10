import { Router, Request, Response, NextFunction } from 'express';
import { getLeads, getLeadById, updateLead } from '../services/lead.store';
import { runEngagementWorkflow } from '../services/agent.service';

const leadRouter = Router();

// GET /api/leads — Fetch all leads stored in leads.json
leadRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const leads = getLeads();
    res.json({ success: true, leads });
  } catch (error) {
    next(error);
  }
});

// POST /api/leads/:leadId/auto-engage — Trigger LangGraph auto-responder for single lead
leadRouter.post('/:leadId/auto-engage', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leadId = req.params.leadId as string;
    const lead = getLeadById(leadId);

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    // Set status to generating
    updateLead(leadId, { engagementStatus: 'generating', engagementError: null });

    // Run the agent workflow synchronously in the request (takes 3-6s)
    console.log(`[Agent] Starting auto-engagement for lead: ${lead.name}`);
    const result = await runEngagementWorkflow(lead);

    if (result.success && result.emailSubject && result.emailDraft) {
      updateLead(leadId, {
        engagementStatus: 'draft_ready',
        emailSubject: result.emailSubject,
        emailDraft: result.emailDraft,
      });
      res.json({
        success: true,
        message: 'Onboarding email draft successfully generated.',
        lead: getLeadById(leadId)
      });
    } else {
      updateLead(leadId, {
        engagementStatus: 'failed',
        engagementError: result.error || 'Agent failed to pass QA constraints.',
      });
      res.status(500).json({
        success: false,
        message: result.error || 'Failed to generate approved onboarding email draft.',
        lead: getLeadById(leadId)
      });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/leads/:leadId/approve-draft — Mock sending the drafted email
leadRouter.post('/:leadId/approve-draft', (req: Request, res: Response, next: NextFunction) => {
  try {
    const leadId = req.params.leadId as string;
    const { emailSubject, emailDraft } = req.body;
    const lead = getLeadById(leadId);

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    // Update status to SALE_DONE (as if sent & completed engagement)
    updateLead(leadId, {
      crm_status: 'SALE_DONE',
      engagementStatus: 'not_engaged', // Reset or mark completed
      emailSubject: emailSubject || lead.emailSubject,
      emailDraft: emailDraft || lead.emailDraft,
      crm_note: `${lead.crm_note}\n\n[System] Approved and sent email onboarding: "${emailSubject}"`
    });

    res.json({
      success: true,
      message: 'Onboarding email marked as sent and status set to SALE_DONE.',
      lead: getLeadById(leadId)
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/leads/auto-engage/batch — Bulk engage selected leads
leadRouter.post('/auto-engage/batch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leadIds } = req.body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      res.status(400).json({ success: false, message: 'No leadIds provided' });
      return;
    }

    res.json({
      success: true,
      message: `Bulk engagement triggered for ${leadIds.length} lead(s). Processing in background...`
    });

    // Run in background
    (async () => {
      for (const id of leadIds) {
        const lead = getLeadById(id as string);
        if (!lead) continue;

        try {
          updateLead(id as string, { engagementStatus: 'generating', engagementError: null });
          const result = await runEngagementWorkflow(lead);
          if (result.success && result.emailSubject && result.emailDraft) {
            updateLead(id as string, {
              engagementStatus: 'draft_ready',
              emailSubject: result.emailSubject,
              emailDraft: result.emailDraft,
            });
          } else {
            updateLead(id as string, {
              engagementStatus: 'failed',
              engagementError: result.error || 'Agent failed to pass QA constraints.',
            });
          }
        } catch (err) {
          console.error(`[Agent] Batch error for lead ${id}:`, err);
          updateLead(id as string, {
            engagementStatus: 'failed',
            engagementError: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }
    })();
  } catch (error) {
    next(error);
  }
});

export { leadRouter };
