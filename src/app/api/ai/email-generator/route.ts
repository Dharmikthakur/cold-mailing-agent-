import { NextResponse } from 'next/server';
import { parseLLMResponse, cleanMarkdown } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { 
      companyName, 
      jobRole, 
      technologies = [], 
      resumeSnippet: candidateSummary = '', 
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

    // 1. Try Groq AI Llama 3.1 8B if API key is present
    const groqKey = process.env.GROQ_API_KEY || '';
    const hasGroq = groqKey && !groqKey.startsWith('gsk_mock_key');

    if (hasGroq) {
      try {
        console.log('Generating cold outreach via Groq API (llama-3.1-8b-instant)...');
        const systemPrompt = `You are an expert career coach and cold outreach writer. 
Generate a professional, highly personalized cold outreach message based on the user's inputs.
You MUST respond with a JSON object in this exact format:
{
  "subject": "Email subject line (empty for linkedin-note)",
  "emailBody": "The generated email body or message text"
}
Keep links like portfolio and github integrated naturally. 
If outreachChannel is 'linkedin-note', keep the emailBody strictly under 300 characters (including spaces, links, and signature). Do not exceed 300 characters. No subject line.`;

        const userPrompt = `
Company Name: ${companyName}
Target Role: ${jobRole}
Technologies to focus on: ${technologies.join(', ')}
Candidate Summary: ${candidateSummary}
Portfolio Link: ${portfolioLink}
GitHub Link: ${githubLink}
Email Type: ${emailType} (either outreach or followup)
Outreach Channel: ${outreachChannel} (can be email, linkedin-note, or linkedin-message)
Tone: ${tone} (can be tech-focused, bold, formal, or conversational)
Recruiter Name: ${recipient}
`;

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7
          })
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const contentText = groqData.choices?.[0]?.message?.content;
          if (contentText) {
            const parsed = parseLLMResponse(contentText);
            if (parsed && (parsed.emailBody || parsed.body)) {
              const body = parsed.emailBody || parsed.body;
              return NextResponse.json({
                subject: cleanMarkdown(parsed.subject || ''),
                emailBody: cleanMarkdown(body || ''),
                emailType,
                companyName,
                jobRole,
                outreachChannel,
                tone
              });
            }
          }
        } else {
          console.warn('Groq API returned an error response:', groqRes.statusText);
        }
      } catch (err) {
        console.error('Groq email generation failed, falling back to templates:', err);
      }
    }

    // 2. Fallback switch cases if Groq is not configured
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

I am writing to express my strong interest in joining ${companyName} as a ${jobRole} intern. As a Computer Science student at Gyan Ganga Institute of Technology and Sciences, I have developed solid foundational skills in modern software engineering, particularly using ${techText}.

Through my internship at SkillHigh, I have gained hands-on experience building functional frontends and modular REST controllers. I am eager to apply my capabilities to your current engineering objectives.

My portfolio and repositories are available below for your review:
${linksBlock || '[Insert portfolio/github links here]'}

Thank you for your consideration. I look forward to the possibility of discussing how I can contribute to the success of ${companyName}.

Sincerely,
[Your Name]`;
        } else if (tone === 'conversational') {
          emailBody = `Hi ${recipient},

I hope you're having a great week!

I've been following ${companyName}'s updates for a while now and am always impressed by your engineering team's approach, especially the work around ${techText}. 

I'm a CS student at GGITS and a full stack developer. I'm looking for a ${jobRole} internship opportunity and would love to connect. I promise to keep it brief—I'd love to learn about what kind of projects interns get to work on at ${companyName}.

You can see some of what I've built here:
${linksBlock || 'https://github.com/dharmikthakur'}

Are you open to connecting?

Best,
[Your Name]`;
        } else {
          // tech-focused
          subject = `Technical Internship Inquiry: ${jobRole} - ${companyName}`;
          emailBody = `Hi ${recipient},

I hope you're doing well.

I came across ${companyName}'s engineering blog recently and noticed your team is working extensively with ${techText}. As a full stack developer who lives and breathes this tech stack, I'm reaching out to express interest in a ${jobRole} internship.

During my recent internship at SkillHigh, I worked on integrating React.js dashboard widgets and designing database REST controllers. I'm confident my familiarity with ${techText} would let me start contributing to your team from day one.

You can inspect my code quality and past projects on GitHub:
${linksBlock || 'https://github.com/dharmikthakur'}

Would you be open to a quick 10-minute chat next week to discuss how I could assist your engineering team?

Best regards,
[Your Name]`;
        }
      } else {
        // Email outreach
        if (tone === 'bold') {
          subject = `Ready to contribute: ${jobRole} Internship at ${companyName}`;
          emailBody = `Dear ${recipient},

I am writing to you directly because I want to join the engineering team at ${companyName} as a ${jobRole} intern. I specialize in building web applications with ${techText} and want to bring my coding skills to your team.

At my recent internship at SkillHigh, I didn't just write HTML; I designed interactive React widgets and connected backend REST API collections. I learn fast, work hard, and know how to collaborate within git-based teams.

My portfolio and repository code are available at:
${linksBlock || 'https://github.com/dharmikthakur'}

I would love to jump on a quick 5-minute call next week to discuss how my hands-on background can benefit your current development sprints. Are you free next Tuesday?

Sincerely,

[Your Name]
[Your Email Address]
[Your Phone Number]`;
        } else if (tone === 'formal') {
          subject = `Application: ${jobRole} Internship - [Your Name]`;
          emailBody = `Dear ${recipient},

I am writing to express my enthusiastic interest in the ${jobRole} internship position at ${companyName}. As a Computer Science student at Gyan Ganga Institute of Technology and Sciences (GGITS), I have developed a strong technical foundation in full stack web development, with particular focus on ${techText}.

During my internship at SkillHigh, I developed scalable dashboard components and connected RESTful API routers. These experiences have equipped me with the practical skills necessary to contribute immediately to ${companyName}'s engineering goals.

My portfolio and repositories are available below for your review:
${linksBlock || '[Insert portfolio/github links here]'}

I have attached my resume for your convenience. I would welcome the opportunity to discuss my qualification further in an interview. Thank you for your time and consideration.

Sincerely,

[Your Name]
[Your Email Address]
[Your Phone Number]`;
        } else if (tone === 'conversational') {
          subject = `Quick question regarding ${companyName}'s tech stack`;
          const intro = `I was reading about ${companyName}'s engineering approach and saw that you utilize ${techText}. As a student and developer, I've built several projects with this exact stack and love how it enables clean code.`;
          
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
          const intro = `I noticed your team at ${companyName} is working on exciting systems and products, particularly leveraging ${techText}. As an aspiring engineer, I would love the opportunity to contribute to this work as a ${jobRole} intern.`;
          
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
