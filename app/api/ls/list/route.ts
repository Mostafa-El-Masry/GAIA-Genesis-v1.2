import { NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs/promises';
export const runtime = 'nodejs';
export async function GET(){
  try{
    const dir = path.join(process.cwd(), 'public', 'backups');
    const names = await fs.readdir(dir);
    const jsons = names.filter(n => n.endsWith('.json'));
    const entries = await Promise.all(jsons.map(async (name) => {
      const stat = await fs.stat(path.join(dir, name));
      return { name, size: stat.size, mtime: stat.mtimeMs };
    }));
    entries.sort((a,b)=> b.mtime - a.mtime);
    return NextResponse.json({ ok:true, files: entries, base:'/backups' });
  }catch{
    return NextResponse.json({ ok:true, files: [], base:'/backups' });
  }
}
