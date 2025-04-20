import { PropsWithChildren } from 'react';
import { NavBar } from './NavBar';

type Props = {};
export function MainLayout({ children }: PropsWithChildren<Props>) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
