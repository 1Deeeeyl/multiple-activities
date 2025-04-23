import React from 'react'
import type { Metadata } from 'next';
import Container from '@/components/container/Container';
import Hero from '@/components/hero/Hero';

export const metadata: Metadata = {
  title: "Markdown Page",
  description: "A Markdown app.",
};
export default function MarkdownPage() {
  return (
    <Container>
      <Hero h1="Markdown Page" description="A simple markdown page." />
    </Container>
  )
}
