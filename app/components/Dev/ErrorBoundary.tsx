'use client';
import React from 'react';
type State = { hasError: boolean; error?: any };
export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, info: any) { console.error('ErrorBoundary caught', error, info); }
  render() {
    if (this.state.hasError) {
      return <div style={{padding:'1rem'}} className="glass">
        <h3>Something broke in this section</h3>
        <pre style={{whiteSpace:'pre-wrap',fontSize:12,opacity:.85}}>{String(this.state.error)}</pre>
      </div>;
    }
    return this.props.children;
  }
}
