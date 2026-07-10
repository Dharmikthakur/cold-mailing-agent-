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
      emailType = 'outreach', // 'outreach' | 'followup'
      contactName = '',
      outreachChannel = 'email', // 'email' | 'linkedin-note' | 'linkedin-message'
      tone = 'tech-focused' // 'tech-focused' | 'bold' | 'formal' | 'conversational'
    } = await request.json();

    const recipient = contactName || (outreachChannel === 'email' ? 'Hiring Team' : 'there');
    const techText = technologies.length > 0 ? technologies.slice(0, 3).join(', ') : 'React, Node.js, and modern APIs';
    
    let subject = '';
    let emailBody = '';

    const portfolioSnippet = portfolioLink ? `Portfolio: ${portfolioLink}` : '';
    const githubSnippet = githubLink ? `GitHub: ${githubLink}` : '';
    const linksBlock = [portfolioSnippet, githubSnippet].filter(Boolean).join('\n');

    if (emailType === 'followup') {
      // Follow-up generation
      if (outreachChannel === 'linkedin-note') {
        emailBody = `Hi ${recipient}, following up on my application for the ${jobRole} role at ${companyName}. I'm extremely excited about your tech stack (${techText}). Connect if you're open to a brief chat! Portfolio: ${portfolioLink || githubLink}`;
      } else if (outreachChannel === 'linkedin-message') {
        subject = `Follow-up: ${jobRole} Internship at ${companyName}`;
        emailBody = `Hi ${recipient},

Hope you're doing well!

I wanted to follow up briefly on my application for the ${jobRole} internship at ${companyName}. 

I am incredibly excited about the possibility of joining your engineering team and contributing to your work using ${techText}. 

You can find my resume and work here:
${linksBlock || 'https://github.com/dharmikthakur'}

Thank you so much for your time, and I look forward to connecting!

Best regards,
[Your Name]`;
      } else {
        // Email followup
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
      }
    } else {
      // Outreach creation
      if (outreachChannel === 'linkedin-note') {
        // Strict 300 character limit templates
        if (tone === 'bold') {
          emailBody = `Hi ${recipient}, I'm a CS student & React/Node dev. I noticed ${companyName} uses ${techText}. I build high-impact web apps and want to join as a ${jobRole} intern. Let's connect! Portfolio: ${portfolioLink || githubLink}`;
        } else if (tone === 'formal') {
          emailBody = `Dear ${recipient}, I am a CS student at GGITS seeking a ${jobRole} internship at ${companyName}. I have hands-on React/Node experience. I would be grateful to connect to discuss future opportunities. Best, [Your Name]`;
        } else if (tone === 'conversational') {
          emailBody = `Hi ${recipient}! I'm a CS student at GGITS and a big fan of ${companyName}'s engineering culture, especially your work with ${techText}. I'd love to connect to say hello and learn more about your journey!`;
        } else {
          // tech-focused (default)
          emailBody = `Hi ${recipient}, noticed you build systems using ${techText} at ${companyName}. As a CS student (GGITS) with React/Node intern experience, I'd love to connect & discuss internship opportunities! GitHub: ${githubLink}`;
        }
      } else if (outreachChannel === 'linkedin-message') {
        subject = `Inquiry: ${jobRole} Internship at ${companyName}`;
        
        if (tone === 'bold') {
          emailBody = `Hi ${recipient},

I'm reaching out because I want to join the engineering team at ${companyName} as a ${jobRole} intern. I specialize in building fast, scalable web applications using ${techText} and have proven experience doing so.

Here is some of my work:
${linksBlock || 'https://github.com/dharmikthakur'}

I know you are busy, but I'd love to jump on a quick 5-minute call next week to show you how my skills can add immediate value to your current projects. Are you free next Tuesday?

Sincerely,
[Your Name]`;
        } else if (tone === 'formal') {
          emailBody = `Dear ${recipient},

I hope this message finds you well.

My name is [Your Name], and I am currently pursuing my Computer Science degree at GGITS. I am writing to express my strong interest in the ${jobRole} internship opportunity at ${companyName}. I have practical experience developing full-stack applications with React.js, Node.js, and REST APIs.

You can view details of my projects and experience here:
${linksBlock || 'https://github.com/dharmikthakur'}

I would be highly grateful for the opportunity to connect and briefly discuss how my background aligns with your engineering goals. Thank you for your time.

Respectfully,
[Your Name]`;
        } else if (tone === 'conversational') {
          emailBody = `Hi ${recipient},

Hope you're having a great week!

I've been following ${companyName}'s updates and really admire what your team is building, particularly using ${techText}. I'm a CS student at GGITS seeking a ${jobRole} internship, and I'd love to connect to hear more about your work and the engineering culture.

Here is a quick look at my projects:
${linksBlock || 'https://github.com/dharmikthakur'}

Would you be open to a casual chat sometime soon? No pressure at all.

Warmly,
[Your Name]`;
        } else {
          // tech-focused
          emailBody = `Hi ${recipient},

I hope you're doing well.

I noticed your engineering team at ${companyName} is building innovative tools leveraging ${techText}. As a CS student at GGITS and full-stack developer with experience in React, Node.js, and MongoDB APIs, I would love the opportunity to contribute to this architecture as a ${jobRole} intern.

You can review my code quality and developer portfolio here:
${linksBlock || 'https://github.com/dharmikthakur'}

Would you be open to a brief chat next week to discuss opportunities on the engineering team?

Best regards,
[Your Name]`;
        }
      } else {
        // email channel
        let intro = '';
        let candidateSummary = resumeSnippet && resumeSnippet.trim().length > 10 
          ? resumeSnippet 
          : `I am currently pursuing my degree in Computer Science. I have hands-on experience building full-stack web applications, designing RESTful APIs, and implementing responsive layouts using React and Node.js.`;

        if (tone === 'bold') {
          subject = `${jobRole} Intern Candidate - Ready to contribute at ${companyName}`;
          intro = `I am a full-stack engineer who builds scalable, high-performance web applications. I noticed your team at ${companyName} is working on exciting projects leveraging ${techText}, and I want to bring my React and Node skills to your engineering team as a ${jobRole} intern.`;
          
          emailBody = `Dear ${recipient},

${intro}

${candidateSummary}

I pride myself on writing clean, maintainable code and learning new frameworks quickly. I would love the opportunity to bring my energy and skills to the engineering team at ${companyName}.

I have detailed my projects on my portfolio and GitHub:
${linksBlock || '[Insert portfolio/github links here]'}

Would you be open to a brief, 10-minute call sometime next week to discuss how my background aligns with your engineering goals? I've attached my resume for your review.

Sincerely,

[Your Name]
[Your Email Address]
[Your Phone Number]`;
        } else if (tone === 'formal') {
          subject = `Application for ${jobRole} Internship - [Your Name]`;
          intro = `I am writing to express my enthusiastic interest in the ${jobRole} internship opportunity at ${companyName}. I have been following ${companyName}'s work with interest, particularly your recent developments in ${techText}, and believe my background makes me a strong fit for your team.`;
          
          emailBody = `Dear ${recipient},

${intro}

${candidateSummary}

I possess a solid understanding of software engineering fundamentals and have completed multiple projects demonstrating clean code practices. I would be honored to contribute to the high standard of engineering at ${companyName}.

For details regarding my work, please refer to my developer links:
${linksBlock || '[Insert portfolio/github links here]'}

I have attached my resume for your review and consideration. I would appreciate the opportunity to discuss my qualifications with you in an interview.

Respectfully,

[Your Name]
[Your Email Address]
[Your Phone Number]`;
        } else if (tone === 'conversational') {
          subject = `Hi ${recipient} - CS Student & Aspiring ${jobRole} Intern at ${companyName}`;
          intro = `I hope you're having a great week! I wanted to reach out because I'm a big fan of ${companyName}'s work, especially how you guys use ${techText}. I'm currently studying CS at GGITS and looking for a ${jobRole} internship, and I'd love to connect.`;
          
          emailBody = `Hi ${recipient},

${intro}

${candidateSummary}

I love learning about how teams solve challenging problems in production. It would be amazing to bring my React/Node skills to the team at ${companyName} and learn from the senior engineers.

You can check out some of my public repositories and portfolio here:
${linksBlock || '[Insert portfolio/github links here]'}

Would you be open to a quick, casual chat next week just to chat about the team's culture and work? I know you're super busy, so even a brief exchange here would be fantastic.

Warmly,

[Your Name]
[Your Email Address]
[Your Phone Number]`;
        } else {
          // tech-focused
          subject = `Internship Inquiry: ${jobRole} - ${companyName} (${techText})`;
          intro = `I noticed your team at ${companyName} is working on exciting systems and products, particularly leveraging ${techText}. As an aspiring engineer, I would love the opportunity to contribute to this work as a ${jobRole} intern.`;
          
          emailBody = `Dear ${recipient},

${intro}

${candidateSummary}

I pride myself on writing clean, maintainable code and learning new frameworks quickly. I would love the opportunity to bring my energy and skills to the engineering team at ${companyName}.

I have detailed my projects on my portfolio and GitHub:
${linksBlock || '[Insert portfolio/github links here]'}

Would you be open to a brief, 10-minute call sometime next week to discuss how my background aligns with your engineering goals? I've attached my resume for your review.

Sincerely,

[Your Name]
[Your Email Address]
[Your Phone Number]`;
        }
      }
    }

    return NextResponse.json({
      subject,
      emailBody,
      emailType,
      companyName,
      jobRole,
      outreachChannel,
      tone
    });
  } catch (error) {
    console.error('Error generating outreach email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
