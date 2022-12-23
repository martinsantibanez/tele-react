import {
  Box,
  Flex,
  HStack,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react';
import Link from 'next/link';
import { BsPencilFill, BsXLg } from 'react-icons/bs';

import { useTeleContext } from '../context/TeleContext';

type Props = {};
export function NavBar({}: Props) {
  const { isEditing, toggleEditting } = useTeleContext();

  const handleToggle = () => toggleEditting();

  return (
    <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <HStack spacing={8} alignItems={'center'}>
          <Link href="/">Ver Tele</Link>
        </HStack>
        <Flex alignItems="center">
          <IconButton
            aria-label="Toggle edit mode"
            onClick={handleToggle}
            icon={
              isEditing ? (
                <BsXLg color="white" />
              ) : (
                <BsPencilFill color="white" />
              )
            }
          />
        </Flex>
      </Flex>
    </Box>
  );
}
