import { NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs/promises';
export const runtime = 'nodejs';
function stamp(){ const d=new Date(); const p=(n:number)=>String(n).padStart(2,'0'); return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; }
export async function POST(req: Request){
  try{
    const body = await req.json();
    const data = body?.data ?? body;
    const filename = body?.filename || `gaia_localstorage_${stamp()}.json`;
    const dir = path.join(process.cwd(), 'public', 'backups');
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return NextResponse.json({ ok:true, filename, path: `/backups/${filename}` });
  }catch(err:any){
    return NextResponse.json({ ok:false, error: err?.message || String(err) }, { status: 500 });
  }
}
