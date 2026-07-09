import { NextResponse } from 'next/server';
import jobs from '@/data/jobs.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.toLowerCase() || '';
    const type = searchParams.get('type')?.toLowerCase() || 'all';

    let filteredJobs = jobs;

    if (query) {
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.skills.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    if (type && type !== 'all') {
      filteredJobs = filteredJobs.filter(
        (job) => job.type.toLowerCase() === type
      );
    }

    return NextResponse.json(filteredJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
