'use client';
import React from 'react';
import { MonitorSource } from '../../components/Monitor/MonitorSource';
import { useSavedSelectedItem } from '../../hooks/useSavedSelectedItem';
import { SourceType } from '../../sources';
import { SourceAccordionList } from '../../components/SelectSource/SourceAccordionList';

type Props = {};
export const ListPage = ({}: Props) => {
  const [sourceSlug, setSourceSlug] = useSavedSelectedItem();

  const handleSelectSource = (source: SourceType) => {
    setSourceSlug(source.slug);
  };
  return (
    <>
      <MonitorSource sourceSlug={sourceSlug} idx={0} />

      <SourceAccordionList
        onSelect={handleSelectSource}
        selectedSourceSlug={sourceSlug}
      />
    </>
  );
};
