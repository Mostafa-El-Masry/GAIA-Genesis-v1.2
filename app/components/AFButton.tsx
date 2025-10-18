'use client';
import React from 'react';
export default function AFButton({ children, ...rest }:{ children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>){
  return <button className="btn" {...rest}>{children}</button>;
}
