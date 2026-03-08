import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

const workflowFiles: Record<string, string> = {
  'get-tickers': '[Get] Tickers.json',
  chat: 'Chat.json'
};

type RouteParams = {
  params: Promise<{
    workflow: string;
  }>;
};

export async function GET(_: Request, context: RouteParams) {
  const { workflow } = await context.params;
  const fileName = workflowFiles[workflow];

  if (!fileName) {
    return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 });
  }

  try {
    const filePath = join(process.cwd(), fileName);
    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });
  } catch {
    return NextResponse.json({ error: 'Falha ao baixar o arquivo.' }, { status: 500 });
  }
}
