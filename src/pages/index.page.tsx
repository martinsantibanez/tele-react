import { Box, Flex, VStack } from '@chakra-ui/react';
import type { NextPage } from 'next';

import { Button, Heading } from '@chakra-ui/react';
import Head from 'next/head';
import { useState } from 'react';
import { useCustomSources } from '../hooks/useCustomSources';
import { useDisplayConfig } from '../hooks/useDisplayConfig';
import { useFeaturedScreen } from '../hooks/useFeaturedScreen';
import { useSavedGrid } from '../hooks/useSavedGrid';
import { useZappingConfig } from '../hooks/useZappingConfig';

import Link from 'next/link';
import { useSavedSelectedItem } from './list/index.page';

type HomeElementProps = {
  title: string;
  description?: string;
  href: string;
  openInNewTab?: boolean;
};

const HomeElement = ({
  href,
  description,
  openInNewTab,
  title
}: HomeElementProps) => {
  return (
    <Link href={href} target={openInNewTab ? '_blank' : ''} passHref>
      <Button
        w="100%"
        // variant="outline"
        colorScheme="gray"
        fontWeight={500}
        fontSize="2xl"
      >
        {title}
      </Button>
    </Link>
  );
};

const Home: NextPage = () => {
  const [, , gridStorage] = useSavedGrid();
  const [, , featuredScreenStorage] = useFeaturedScreen();
  const [, , selectedItemStorage] = useSavedSelectedItem();
  const { customSourcesMeta } = useCustomSources();
  const [, , displayConfigStorage] = useDisplayConfig();
  const { zappingConfigMeta } = useZappingConfig();

  const [clearedState, setClearedState] = useState(false);
  const handleClearLocalStorage = () => {
    if (clearedState) {
      setClearedState(false);
      return;
    }
    gridStorage.removeItem();
    selectedItemStorage.removeItem();
    featuredScreenStorage.removeItem();
    customSourcesMeta.removeItem();
    displayConfigStorage.removeItem();
    zappingConfigMeta.removeItem();
    setClearedState(true);
  };

  return (
    <>
      <Head>
        <title>Ver Tele</title>
        <meta name="description" content="Visor de canales de TV chilena" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Flex minH="80vh" align="center" justify="center">
          <Box py={12}>
            <Heading as="h1" fontSize="4xl" pb={12} textAlign="center">
              Ver Tele
            </Heading>
            <VStack spacing={3} textAlign="center">
              <HomeElement
                href="/monitor"
                title="Monitor"
                description="Monitor personalizable. Filas o layout."
              />
              <HomeElement
                href="/promoted"
                title="Señal Destacada"
                description="Abrelo en otra ventana, y destaca una señal desde la cuadrícula."
                openInNewTab
              />
              <HomeElement
                href="/list"
                title="Lista"
                description="Elige solo un canal de la lista."
              />
              <Button variant="outline" onClick={handleClearLocalStorage}>
                {clearedState ? '✅ Borrado' : 'Borrar datos locales'}
              </Button>
            </VStack>
          </Box>
        </Flex>
      </main>
    </>
  );
};

export default Home;
