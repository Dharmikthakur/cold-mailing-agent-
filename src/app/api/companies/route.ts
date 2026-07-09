import { NextResponse } from 'next/server';
import companies from '@/data/companies.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.toLowerCase() || '';
    const location = searchParams.get('location')?.toLowerCase() || 'all';
    const remote = searchParams.get('remote')?.toLowerCase() || 'all';
    const size = searchParams.get('size')?.toLowerCase() || 'all';
    const industry = searchParams.get('industry')?.toLowerCase() || 'all';

    let filtered = companies;

    // Filter by general keyword search (name, description, technologies, location)
    if (query) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.industry.toLowerCase().includes(query) ||
          c.technologies.some((tech) => tech.toLowerCase().includes(query)) ||
          c.location.toLowerCase().includes(query)
      );
    }

    // Filter by specific location
    if (location && location !== 'all') {
      filtered = filtered.filter((c) =>
        c.location.toLowerCase().includes(location)
      );
    }

    // Filter by remote policy
    if (remote && remote !== 'all') {
      filtered = filtered.filter((c) =>
        c.remote.toLowerCase() === remote
      );
    }

    // Filter by company size
    if (size && size !== 'all') {
      filtered = filtered.filter((c) =>
        c.size.toLowerCase() === size
      );
    }

    // Filter by industry
    if (industry && industry !== 'all') {
      filtered = filtered.filter((c) =>
        c.industry.toLowerCase().includes(industry)
      );
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
