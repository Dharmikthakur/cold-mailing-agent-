import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { 
      companyName, 
      jobRole, 
      technologies = [], 
      resumeSnippet = '', 
      portfolioLink = '', 
      githubLink = '', 
      emailType = 'outreach',
      contactName = ''
    } = await request.json();

    const recipient = contactName || 'Hiring Team';
    const techText = technologies.length > 0 ? technologies.slice(0, 3).join(', ') : 'modern tech stacks';
    
    let subject = '';
    let emailBody = '';

    const portfolioSnippet = portfolioLink ? `Portfolio: ${portfolioLink}` : '';
    const githubSnippet = githubLink ? `GitHub: ${githubLink}` : '';
    const linksBlock = [portfolioSnippet, githubSnippet].filter(Boolean).join('\n');

    if (emailType === 'followup') {
      subject = `Follow-up: Internship Application - ${jobRole} at ${companyName}`;
      emailBody = `Dear ${recipient},

I hope this email finds you well.

I wanted to quickly follow up on my application for the ${jobRole} internship position at ${companyName} that I submitted last week. 

I understand that the hiring team is busy, but I wanted to reiterate my enthusiastic interest in joining your team. I am very excited about the possibility of contributing to the technologies you are building, especially with your work involving ${techText}.

For your convenience, I have attached my resume again, and you can also view my profiles here:
${linksBlock || '[Insert portfolio/github links here]'}

Thank you so much for your time and consideration, and I look forward to hearing from you.

Best regards,

[Your Name]
[Your Phone Number]`;
    } else {
      // outreach email
      subject = `Internship Inquiry: ${jobRole} - ${companyName}`;
      
      const intro = `I noticed your team at ${companyName} is working on exciting systems and products, particularly leveraging ${techText}. As an aspiring engineer, I would love the opportunity to contribute to this work as a ${jobRole} intern.`;
      
      let candidateSummary = `I am currently pursuing my degree in Computer Science. I have hands-on experience building full-stack web applications, designing RESTful APIs, and implementing responsive layouts using React and Node.js.`;
      
      if (resumeSnippet && resumeSnippet.trim().length > 10) {
        candidateSummary = resumeSnippet;
      }

      emailBody = `Dear ${recipient},

${intro}

${candidateSummary}

I pride myself on writing clean, maintainable code and learning new frameworks quickly. I would love the opportunity to bring my energy and skills to the engineering team at ${companyName}.

I have detailed my projects on my portfolio and GitHub:
${linksBlock || '[Insert portfolio/github links here]'}

Would you be open to a brief, 10-minute call sometime next week to discuss how my background aligns with your engineering goals? I've attached my resume for your review.

Thank you for your time and consideration.

Sincerely,

[Your Name]
[Your Email Address]
[Your Phone Number]`;
    }

    return NextResponse.json({
      subject,
      emailBody,
      emailType,
      companyName,
      jobRole
    });
  } catch (error) {
    console.error('Error generating outreach email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
