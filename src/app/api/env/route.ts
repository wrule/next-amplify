import { envInfo } from '@/aws';
import { NextResponse } from 'next/server';

export
async function GET() {
  return NextResponse.json(envInfo);
}
