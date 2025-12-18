/**
 * Simulated Email Service
 * In a production environment, this would call a backend API or a service like SendGrid/AWS SES.
 */
export const sendEmail = async (params: { 
  to: string; 
  subject: string; 
  body: string;
  attachments?: string[];
}): Promise<{ success: boolean }> => {
  console.log('--- SIMULATED EMAIL DISPATCH ---');
  console.log(`To: ${params.to}`);
  console.log(`Subject: ${params.subject}`);
  console.log(`Body: ${params.body}`);
  if (params.attachments && params.attachments.length > 0) {
    console.log(`Attachments: ${params.attachments.join(', ')}`);
  }
  console.log('-------------------------------');

  // Simulate network latency
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1500);
  });
};