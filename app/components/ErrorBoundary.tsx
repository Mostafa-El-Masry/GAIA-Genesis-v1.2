'use client';
import React from 'react';
type Props = { children: React.ReactNode, fallback?: React.ReactNode };
type State = { hasError: boolean };
export default class ErrorBoundary extends React.Component<Props, State>{
  constructor(props: Props){
    super(props); this.state = { hasError: false };
  }
  static getDerivedStateFromError(_: any){ return { hasError: true }; }
  componentDidCatch(error:any, info:any){ console.error('Dashboard tile crashed:', error, info); }
  render(){
    if(this.state.hasError) return this.props.fallback ?? <div className="glass" style={{padding:'1rem',borderRadius:12}}>Something went wrong.</div>;
    return this.props.children as any;
  }
}
