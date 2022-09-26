import { Box } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { NavBar } from './NavBar';

type Props = {};
export function MainLayout({ children }: PropsWithChildren<Props>) {
  return (
    <Box as="section" bg="gray.700" minH="100vh">
      <NavBar />
      {children}
    </Box>
  );
}
