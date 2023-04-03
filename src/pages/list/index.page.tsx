import type { NextPage } from 'next';
import Head from 'next/head';
import useLocalStorageState from 'use-local-storage-state';
import { Source } from '../../components/Monitor/Source';
import { SourceAccordionList } from '../../components/SelectSource/SourceAccordionList';
import { MainLayout } from '../../layout/MainLayout';
import { SourceType, SourceInputType } from '../../sources';

export function useSavedSelectedItem() {
  return useLocalStorageState<string | undefined>('__tele_selected__');
}

const ListPage: NextPage = () => {
  const [sourceSlug, setSourceSlug] = useSavedSelectedItem();

  const handleSelectSource = (source: SourceType) => {
    setSourceSlug(source.slug);
  };

  return (
    <MainLayout>
      <Head>
        <title>Tele - List</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="row w-100 mw-100">
        <div className="col-8">
          <Source size={12} sourceSlug={sourceSlug} />
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
