import { NextResponse } from 'next/server';
import { gif } from '@/graphql/queries';
import { GQLClient } from '@/aws';

interface RequestData {
  width: number;
  height: number;
  interval: number;
  images: string[];
}

export async function POST(request: Request) {
  try {
    const { width, height, interval, images }: RequestData = await request.json();

    if (!width || !height || !interval || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: '参数无效' },
        { status: 400 }
      );
    }

    const res = await GQLClient.graphql({
      query: gif,
      variables: {
        pics: images,
        delayCentisecs: interval,
        w: width,
        h: height,
      },
    });

    return NextResponse.json({ data: res.data });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: '处理失败' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};
