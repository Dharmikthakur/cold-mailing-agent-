import { NextResponse } from 'next/server';
import jobs from '@/data/jobs.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.toLowerCase() || '';
    const type = searchParams.get('type')?.toLowerCase() || 'all';
    const industry = searchParams.get('industry')?.toLowerCase() || 'all';
    const size = searchParams.get('size')?.toLowerCase() || 'all';
    const internshipOnly = searchParams.get('internship') === 'true';

    const adzunaId = process.env.ADZUNA_APP_ID || '';
    const adzunaKey = process.env.ADZUNA_APP_KEY || '';

    let externalJobs: any[] = [];

    // If Adzuna credentials are provided, use Adzuna API
    if (adzunaId && adzunaKey) {
      try {
        console.log('Fetching live jobs from Adzuna API...');
        const country = 'in'; // default to India search index
        
        // Construct Adzuna search term query
        let adzunaQuery = query || 'developer';
        if (internshipOnly) {
          adzunaQuery += ' internship';
        }
        if (type === 'remote') {
          adzunaQuery += ' remote';
        } else if (type === 'hybrid') {
          adzunaQuery += ' hybrid';
        } else if (type === 'onsite' || type === 'on-site') {
          adzunaQuery += ' onsite';
        }

        // Set results_per_page to 50 to retrieve a large, rich job dataset
        const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${adzunaId}&app_key=${adzunaKey}&what=${encodeURIComponent(adzunaQuery)}&results_per_page=50`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        
        const apiRes = await fetch(adzunaUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData && Array.isArray(apiData.results)) {
            externalJobs = apiData.results.map((item: any, index: number) => {
              // Format salary range
              let salaryStr = 'Competitive / Unspecified';
              if (item.salary_min) {
                const minFormatted = Math.round(item.salary_min).toLocaleString('en-IN');
                if (item.salary_max) {
                  const maxFormatted = Math.round(item.salary_max).toLocaleString('en-IN');
                  salaryStr = `₹${minFormatted} - ₹${maxFormatted}/year`;
                } else {
                  salaryStr = `₹${minFormatted}/year`;
                }
              }

              // Strip HTML tags from title and description
              const cleanTitle = item.title ? item.title.replace(/<[^>]*>/g, '') : 'Software Developer';
              const cleanDesc = item.description ? item.description.replace(/<[^>]*>/g, ' ') : 'Detailed job requirements and description.';

              // Determine work type based on contract features
              let jobType = 'Full-time';
              if (item.contract_time === 'part_time') {
                jobType = 'Part-time';
              } else if (item.contract_time === 'contract') {
                jobType = 'Contract';
              }

              // Generate basic mock tags/skills
              const skillsList = ['React.js', 'Node.js', 'JavaScript', 'Git'];
              if (cleanTitle.toLowerCase().includes('python')) skillsList.push('Python');
              if (cleanTitle.toLowerCase().includes('java')) skillsList.push('Java');
              if (cleanTitle.toLowerCase().includes('design') || cleanTitle.toLowerCase().includes('ux')) skillsList.push('UI/UX Design', 'Figma');

              return {
                id: `adz-${item.id || index}`,
                title: cleanTitle,
                company: item.company?.display_name || 'Hiring Company',
                location: item.location?.display_name || 'India',
                type: item.location?.display_name?.toLowerCase().includes('remote') ? 'Remote' : jobType,
                salary: salaryStr,
                postedDate: item.created ? new Date(item.created).toLocaleDateString() : 'Recent (Adzuna)',
                description: cleanDesc,
                requirements: [
                  "Strong communication skills and collaborative team presence.",
                  "Knowledge of computer science fundamentals, algorithms, and data structures.",
                  "Hands-on coding capability matching role responsibilities."
                ],
                skills: skillsList
              };
            });
          }
        }
      } catch (adzunaErr) {
        console.error('Adzuna API call failed, falling back to keyless Arbeitnow API:', adzunaErr);
      }
    }

    // 2. If Adzuna credentials are not set, or Adzuna failed, fall back to keyless Arbeitnow API
    if (externalJobs.length === 0) {
      console.log('Adzuna credentials not configured or request failed. Falling back to Arbeitnow API...');
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        
        const apiRes = await fetch('https://www.arbeitnow.com/api/job-board-api', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData && Array.isArray(apiData.data)) {
            externalJobs = apiData.data.map((job: any, index: number) => {
              const tags = Array.isArray(job.tags) && job.tags.length > 0 
                ? job.tags 
                : ["React.js", "Node.js", "TypeScript", "Python"];
                
              return {
                id: `ext-${job.slug || index}`,
                title: job.title,
                company: job.company_name,
                location: job.location || "Remote",
                type: job.remote ? "Remote" : "Full-time",
                salary: "Competitive / Unspecified",
                postedDate: "Recent (Arbeitnow)",
                description: job.description ? job.description.replace(/<[^>]*>/g, ' ') : "A great software development opportunity.",
                requirements: [
                  "Experience working in modern technology environments.",
                  "Familiarity with collaborative engineering guidelines and frameworks.",
                  "Detail-oriented developer with solid algorithmic fundamentals."
                ],
                skills: tags
              };
            });
          }
        }
      } catch (apiErr) {
        console.warn('Could not load jobs from Arbeitnow API:', apiErr);
      }
    }

    // 3. Merge local mock jobs with external API jobs
    let combinedJobs = [...jobs, ...externalJobs];

    // 4. Local Filtering heuristics:
    
    // search query filter
    if (query) {
      combinedJobs = combinedJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.skills.some((skill: string) => skill.toLowerCase().includes(query))
      );
    }

    // internship section filter
    if (internshipOnly) {
      combinedJobs = combinedJobs.filter(
        (job) =>
          job.title.toLowerCase().includes('intern') ||
          job.title.toLowerCase().includes('co-op') ||
          job.type.toLowerCase().includes('intern') ||
          job.description.toLowerCase().includes('internship')
      );
    }

    // work model filter (Fixes remote/hybrid/on-site filters)
    if (type && type !== 'all') {
      combinedJobs = combinedJobs.filter((job) => {
        const isRemote = job.type === 'Remote' || job.location.toLowerCase().includes('remote') || job.type.toLowerCase().includes('remote');
        const isHybrid = job.location.toLowerCase().includes('hybrid') || job.title.toLowerCase().includes('hybrid');
        
        if (type === 'remote') {
          return isRemote;
        } else if (type === 'hybrid') {
          return isHybrid;
        } else if (type === 'on-site' || type === 'onsite') {
          return !isRemote && !isHybrid;
        }
        return true;
      });
    }

    // industry filter
    if (industry && industry !== 'all') {
      combinedJobs = combinedJobs.filter((job) => {
        const title = job.title.toLowerCase();
        const desc = job.description.toLowerCase();
        
        if (industry === 'search & ai' || industry === 'artificial intelligence') {
          return title.includes('ai') || title.includes('machine learning') || title.includes('search') || desc.includes('artificial intelligence') || desc.includes('llm');
        } else if (industry === 'fintech') {
          return title.includes('finance') || title.includes('fintech') || title.includes('payment') || desc.includes('blockchain') || desc.includes('banking');
        } else if (industry === 'developer tools') {
          return title.includes('developer tools') || title.includes('devops') || title.includes('cli') || desc.includes('ci/cd') || desc.includes('infrastructure');
        } else if (industry === 'design') {
          return title.includes('design') || title.includes('ui') || title.includes('ux') || desc.includes('figma') || desc.includes('css');
        } else if (industry === 'saas') {
          return title.includes('saas') || desc.includes('software as a service') || desc.includes('cloud');
        } else if (industry === 'edtech') {
          return title.includes('education') || title.includes('learning') || desc.includes('student') || desc.includes('edtech');
        }
        return true;
      });
    }

    // company scale / size filter
    if (size && size !== 'all') {
      combinedJobs = combinedJobs.filter((job) => {
        const company = job.company.toLowerCase();
        const enterpriseList = ['google', 'hp', 'microsoft', 'amazon', 'allianz', 'kyndryl', 'stripe', 'vercel'];
        const isEnterprise = enterpriseList.some(ent => company.includes(ent));
        
        if (size === 'enterprise') {
          return isEnterprise;
        } else if (size === 'startup') {
          return !isEnterprise && !company.includes('inc') && !company.includes('technologies');
        } else if (size === 'mid-sized') {
          return !isEnterprise && (company.includes('inc') || company.includes('technologies') || job.skills.length > 3);
        }
        return true;
      });
    }

    return NextResponse.json(combinedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
