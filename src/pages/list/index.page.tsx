import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { createLocalStorageStateHook } from 'use-local-storage-state';
import { Monitor } from '../../components/Monitor/Monitor';
import { SourceAccordionList } from '../../components/SelectSource/SourceAccordionList';
import { MainLayout } from '../../layout/MainLayout';
import { Source } from '../../sources';

export const useSavedSelectedItem = createLocalStorageStateHook<
  string | undefined
>('__tele_selected__');

const ListPage: NextPage = () => {
  const [sourceSlug, setSourceSlug] = useState<string>();

  const handleSelectSource = (source: Source) => {
    setSourceSlug(source.slug);
  };

  return (
    <MainLayout>
      <Head>
        <title>Tele - List</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="row w-100 mw-100">
        <div className="col-8">
          <Monitor size={12} sourceSlug={sourceSlug} />
        </div>
        <div className="col-4">
          <SourceAccordionList
            onSelect={handleSelectSource}
            selectedSourceSlug={sourceSlug}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default ListPage;
