import { NextResponse } from 'next/server';
import jobs from '@/data/jobs.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.toLowerCase() || '';
    const type = searchParams.get('type')?.toLowerCase() || 'all';

    // 1. Fetch from Arbeitnow Job Board API
    let externalJobs: any[] = [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout limit to keep API fast
      
      const apiRes = await fetch('https://www.arbeitnow.com/api/job-board-api', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData && Array.isArray(apiData.data)) {
          // Map external jobs into local schema
          externalJobs = apiData.data.map((job: any, index: number) => {
            // Pick tags or generate basic developer tags
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
              description: job.description ? job.description.replace(/<[^>]*>/g, ' ') : "A great software development opportunity.", // strip basic HTML tags
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
      console.warn('Could not load jobs from external API, using local backup list:', apiErr);
    }

    // 2. Merge local mock jobs with external API jobs
    let combinedJobs = [...jobs, ...externalJobs];

    // 3. Filter combined jobs
    if (query) {
      combinedJobs = combinedJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.skills.some((skill: string) => skill.toLowerCase().includes(query))
      );
    }

    if (type && type !== 'all') {
      combinedJobs = combinedJobs.filter((job) => {
        if (type === 'remote') {
          return job.location.toLowerCase().includes('remote') || job.type.toLowerCase().includes('remote');
        }
        return job.type.toLowerCase() === type || job.type.toLowerCase().includes(type);
      });
    }

    return NextResponse.json(combinedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
