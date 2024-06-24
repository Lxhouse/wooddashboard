'use client';
import { MouseEvent, useTransition } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

interface ILinkProps {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  href: string;
  target?: string;
}

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>) {
  const eventTarget = event.currentTarget;
  const target = eventTarget.getAttribute('target');
  return (
    (target && target !== '_self') ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    (event.nativeEvent && (event.nativeEvent as MouseEvent).which === 2)
  );
}
