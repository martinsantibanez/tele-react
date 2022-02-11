import type { NextPage } from "next";
import Head from "next/head";
import { ChangeEventHandler, CSSProperties, useEffect, useState } from "react";
import { createLocalStorageStateHook } from "use-local-storage-state";
import { Monitor } from "../../components/Monitor/Monitor";
import { ScreenOptions } from "../../components/ScreenOptions/ScreenOptions";
import { SourceAccordionList } from "../../components/SelectSource/SourceAccordionList";
import { useTeleContext } from "../../context/TeleContext";
import { MainLayout } from "../../layout/MainLayout";
import { Source } from "../../sources";
import { uuid } from "../../utils/uuid";
import { SourceNode } from "../layout/types";
import { initialGrid } from "./initialGrid";

const reloadStyle: CSSProperties = {
  position: "absolute",
  bottom: "0.3em",
  right: "0.3em",
  width: "auto",
  height: "25px",
  lineHeight: "25px",
  textAlign: "left",
};

export const useSavedGrid =
  createLocalStorageStateHook<SourceNode[]>("__tele_grid__");
export const useCustomSources = createLocalStorageStateHook<Source[]>(
  "__tele_custom_source__"
);

const GridPage: NextPage = () => {
  const [size, setSize] = useState(6);

  const handleSizeChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    setSize(Number(event.target.value));
  };

  const [selectedSources, setSelectedSources] = useSavedGrid();

  useEffect(() => {
    if (!selectedSources) setSelectedSources(initialGrid);
  }, [selectedSources, setSelectedSources]);

  const [changingIdx, setChangingIdx] = useState<number>();

  const handleSourceChange = (source: Source, idxToChange: number) => {
    setSelectedSources((sources) => {
      if (!sources) return;
      return sources.map((src, idx) => {
        if (idxToChange === idx) return { ...src, sourceSlug: source.slug };
        else return src;
      });
    });
  };

  const handleSourceAdd = () => {
    setSelectedSources((sources) => [
      ...(sources || []),
      {
        sourceSlug: "Barras",
        uuid: uuid(),
      },
    ]);
  };

  const handleSourceRemove = (idx: number) => {
    setSelectedSources((sources) => {
      if (!sources) return;
      return sources.filter((src, index) => index !== idx);
    });
  };

  const { isEditing, editingSourceIdx, setEditingSourceIdx } = useTeleContext();
  return (
    <MainLayout>
      <Head>
        <title>Ver Tele - Grid</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="row">
        <div className={!!editingSourceIdx ? "col-8" : "col-12"}>
          <div className="row no-gutters row-canales">
            {selectedSources &&
              selectedSources.map((source, idx) => (
                <Monitor
                  size={size}
                  sourceSlug={source.sourceSlug}
                  key={`${source.sourceSlug}_${idx}`}
                  onChangeClick={() => setEditingSourceIdx(idx)}
                  onRemove={() => handleSourceRemove(idx)}
                />
              ))}
          </div>
        </div>
        {editingSourceIdx !== undefined &&
          editingSourceIdx !== null &&
          selectedSources &&
          selectedSources[editingSourceIdx] && (
            <div className="col-4">
              <SourceAccordionList
                onSelect={(source: Source) =>
                  handleSourceChange(source, editingSourceIdx)
                }
                selectedSourceSlug={
                  selectedSources[editingSourceIdx].sourceSlug
                }
              />
            </div>
          )}
        {isEditing && (
          <ScreenOptions
            onSizeChange={handleSizeChange}
            onSourceAdd={handleSourceAdd}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default GridPage;