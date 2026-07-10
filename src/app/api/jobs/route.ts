import { NextResponse } from 'next/server';
import jobs from '@/data/jobs.json';

// Fetch Adzuna (Localized search in India)
async function fetchAdzuna(query: string, type: string, internship: boolean, appId: string, appKey: string) {
  try {
    const country = 'in';
    let adzunaQuery = query || 'developer';
    if (internship) adzunaQuery += ' internship';
    if (type === 'remote') adzunaQuery += ' remote';
    else if (type === 'hybrid') adzunaQuery += ' hybrid';
    else if (type === 'onsite' || type === 'on-site') adzunaQuery += ' onsite';

    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(adzunaQuery)}&results_per_page=50`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const apiRes = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!apiRes.ok) throw new Error('Adzuna fetch failed');
    const data = await apiRes.json();
    if (!data || !Array.isArray(data.results)) return [];
    
    return data.results.map((item: any, index: number) => {
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
      const cleanTitle = item.title ? item.title.replace(/<[^>]*>/g, '') : 'Software Developer';
      const cleanDesc = item.description ? item.description.replace(/<[^>]*>/g, ' ') : '';
      let jobType = 'Full-time';
      if (item.contract_time === 'part_time') jobType = 'Part-time';
      else if (item.contract_time === 'contract') jobType = 'Contract';

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
  } catch (e) {
    console.error('Error fetching Adzuna:', e);
    return [];
  }
}

// Fetch Jobicy (Global Remote jobs)
async function fetchJobicy(query: string) {
  try {
    const tag = query || 'developer';
    const url = `https://jobicy.com/api/v2/remote-jobs?count=50&tag=${encodeURIComponent(tag)}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const apiRes = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!apiRes.ok) throw new Error('Jobicy fetch failed');
    const data = await apiRes.json();
    if (!data || !Array.isArray(data.jobs)) return [];
    
    return data.jobs.map((item: any, index: number) => {
      let salaryStr = 'Competitive / Unspecified';
      if (item.annualSalaryMin) {
        const currency = item.salaryCurrency || 'USD';
        const minFormatted = Math.round(item.annualSalaryMin).toLocaleString();
        if (item.annualSalaryMax) {
          const maxFormatted = Math.round(item.annualSalaryMax).toLocaleString();
          salaryStr = `${currency} ${minFormatted} - ${maxFormatted}/yr`;
        } else {
          salaryStr = `${currency} ${minFormatted}/yr`;
        }
      }
      const cleanTitle = item.jobTitle ? item.jobTitle.replace(/<[^>]*>/g, '') : 'Remote Developer';
      const cleanDesc = item.jobDescription ? item.jobDescription.replace(/<[^>]*>/g, ' ') : '';
      
      const skillsList = ['React.js', 'Node.js', 'JavaScript', 'Git'];
      if (cleanTitle.toLowerCase().includes('python')) skillsList.push('Python');
      if (cleanTitle.toLowerCase().includes('java')) skillsList.push('Java');
      if (cleanTitle.toLowerCase().includes('design') || cleanTitle.toLowerCase().includes('ux')) skillsList.push('UI/UX Design', 'Figma');

      return {
        id: `jobicy-${item.id || index}`,
        title: cleanTitle,
        company: item.companyName || 'Remote Org',
        location: item.jobGeo || 'Remote',
        type: 'Remote',
        salary: salaryStr,
        postedDate: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Recent (Jobicy)',
        description: cleanDesc,
        requirements: [
          "Self-motivated and comfortable working in remote-first pipelines.",
          "Strong communication skills and collaborative team presence.",
          "Competence with version control systems and modern toolkits."
        ],
        skills: skillsList
      };
    });
  } catch (e) {
    console.error('Error fetching Jobicy:', e);
    return [];
  }
}

// Fetch Himalayas (Global Remote tech jobs)
async function fetchHimalayas() {
  try {
    const url = `https://himalayas.app/jobs/api?limit=30`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const apiRes = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!apiRes.ok) throw new Error('Himalayas fetch failed');
    const data = await apiRes.json();
    if (!data || !Array.isArray(data.jobs)) return [];

    return data.jobs.map((item: any, index: number) => {
      let salaryStr = 'Competitive / Unspecified';
      if (item.minSalary) {
        const currency = item.salaryCurrency || '$';
        const minFormatted = Math.round(item.minSalary).toLocaleString();
        if (item.maxSalary) {
          const maxFormatted = Math.round(item.maxSalary).toLocaleString();
          salaryStr = `${currency}${minFormatted} - ${maxFormatted}/yr`;
        } else {
          salaryStr = `${currency}${minFormatted}/yr`;
        }
      }
      const cleanTitle = item.title || 'Remote Engineer';
      const cleanDesc = item.description || item.excerpt || 'Detailed remote engineering role.';
      
      const skillsList = ['React.js', 'Node.js', 'JavaScript', 'Git'];
      if (cleanTitle.toLowerCase().includes('python')) skillsList.push('Python');
      if (cleanTitle.toLowerCase().includes('java')) skillsList.push('Java');
      if (cleanTitle.toLowerCase().includes('design') || cleanTitle.toLowerCase().includes('ux')) skillsList.push('UI/UX Design', 'Figma');

      return {
        id: `himalayas-${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`,
        title: cleanTitle,
        company: item.company?.name || 'Remote Corp',
        location: item.location || 'Remote',
        type: 'Remote',
        salary: salaryStr,
        postedDate: 'Recent (Himalayas)',
        description: cleanDesc,
        requirements: [
          "Excellent written communication skills for asynchronous setups.",
          "Willingness to take ownership and manage personal sprint targets.",
          "Solid engineering fundamentals aligned with clean code standards."
        ],
        skills: skillsList
      };
    });
  } catch (e) {
    console.error('Error fetching Himalayas:', e);
    return [];
  }
}

// Fetch Arbeitnow (Global tech jobs)
async function fetchArbeitnow() {
  try {
    const url = 'https://www.arbeitnow.com/api/job-board-api';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const apiRes = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!apiRes.ok) throw new Error('Arbeitnow fetch failed');
    const data = await apiRes.json();
    if (!data || !Array.isArray(data.data)) return [];

    return data.data.map((job: any, index: number) => {
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
  } catch (e) {
    console.error('Error fetching Arbeitnow:', e);
    return [];
  }
}

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

    // Fire API requests in parallel concurrently
    const fetchPromises = [
      fetchJobicy(query),
      fetchHimalayas(),
      fetchArbeitnow()
    ];

    if (adzunaId && adzunaKey) {
      fetchPromises.push(fetchAdzuna(query, type, internshipOnly, adzunaId, adzunaKey));
    }

    const results = await Promise.allSettled(fetchPromises);
    
    // Flatten successful arrays
    const externalJobs: any[] = [];
    results.forEach((result) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        externalJobs.push(...result.value);
      }
    });

    // Merge local jobs with all external API jobs
    let combinedJobs = [...jobs, ...externalJobs];

    // Filter combined jobs locally
    if (query) {
      combinedJobs = combinedJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.skills.some((skill: string) => skill.toLowerCase().includes(query))
      );
    }

    if (internshipOnly) {
      combinedJobs = combinedJobs.filter(
        (job) =>
          job.title.toLowerCase().includes('intern') ||
          job.title.toLowerCase().includes('co-op') ||
          job.type.toLowerCase().includes('intern') ||
          job.description.toLowerCase().includes('internship')
      );
    }

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

    // Deduplicate lists by ID or Title/Company hash to keep results unique
    const seen = new Set<string>();
    combinedJobs = combinedJobs.filter((job) => {
      const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json(combinedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
