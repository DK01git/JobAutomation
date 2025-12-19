
/**
 * Email Service
 * Handles simulated dispatch, direct browser handoff, and real GAS Relay execution.
 */
export const sendEmail = async (params: { 
  to: string; 
  subject: string; 
  body: string;
  gasUrl?: string; // Real autonomous relay URL
  attachments?: string[];
  coverLetterText?: string; // New: Pass text for dynamic PDF generation
}): Promise<{ success: boolean; mailtoUrl?: string; mode: 'relay' | 'mailto' }> => {
  console.log('%c--- EMAIL ORCHESTRATOR: PROCESSING ---', 'color: #3b82f6; font-weight: bold;');
  
  // Clean the body: Remove any duplicated Subject line if the AI included it by mistake
  const sanitizedBody = params.body.replace(/^Subject:\s*.*\n?/i, '').trim();

  // 1. If GAS URL is provided, try real autonomous sending with ATTACHMENT support
  if (params.gasUrl) {
    console.log(`%cAttempting Autonomous Relay via GAS...`, 'color: #10b981');
    try {
      // Use no-cors mode for simple POST to GAS
      await fetch(params.gasUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: params.to,
          subject: params.subject,
          body: sanitizedBody,
          attachments: params.attachments || [], // Pass filenames for Drive CV search
          coverLetter: params.coverLetterText || "" // Pass text for dynamic PDF creation
        })
      });
      
      console.log(`%cRelay Triggered Successfully.`, 'color: #10b981');
      return { success: true, mode: 'relay' };
    } catch (e) {
      console.error("GAS Relay failed, falling back to mailto:", e);
    }
  }

  // 2. Fallback: Create a mailto URL for local client handoff
  // Note: mailto does NOT support attachments via browser URL for security reasons.
  const mailtoUrl = `mailto:${params.to}?subject=${encodeURIComponent(params.subject)}&body=${encodeURIComponent(sanitizedBody)}`;

  console.group('Mailto Fallback Metadata');
  console.log(`Recipient: ${params.to}`);
  console.log(`Subject: ${params.subject}`);
  console.log(`Note: Attachments [${params.attachments?.join(', ')}] must be manually added in mail client.`);
  console.groupEnd();

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, mailtoUrl, mode: 'mailto' });
    }, 1500);
  });
};
