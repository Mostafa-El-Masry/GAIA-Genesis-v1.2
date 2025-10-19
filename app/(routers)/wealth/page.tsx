import Link from 'next/link';
export default function WealthHome(){
  return (<main style={{display:'grid',gap:12}}>
    <h2 className="text-3xl font-bold">💼 Wealth</h2>
    <p style={{opacity:.8}}>Manage your savings certificates, track payouts, and record receipts.</p>
    <div><Link className="btn btn-primary" href="/wealth/certificates">Go to Certificates →</Link></div>
  </main>);
}
