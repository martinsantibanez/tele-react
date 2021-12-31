import type { NextPage } from "next";
import Head from "next/head";
import { clone } from "ramda";
import { useEffect } from "react";
import { createLocalStorageStateHook } from "use-local-storage-state";
import { Monitor } from "../../components/Monitor/Monitor";
import { initialLayout } from "./initialLayout";
import { Col, Layout, Row, SourceNode } from "./types";

function Col({
  col,
  onSourceChange,
}: {
  col: Col;
  onSourceChange: (node: SourceNode) => void;
}) {
  const { rows, node } = col;
  const size = col.size || 12;
  if (node?.source)
    return (
      <Monitor
        size={size}
        source={node.source}
        onChange={(source) => onSourceChange({ ...node, source })}
      />
    );

  return (
    <div className={`col-${size}`}>
      {rows?.map((row, i) => (
        <Row key={i} row={row} onSourceChange={onSourceChange} />
      ))}
    </div>
  );
}

function Row({
  row,
  onSourceChange,
}: {
  row: Row;
  onSourceChange: (node: SourceNode) => void;
}) {
  const { cols } = row;
  return (
    <div className="row no-gutters">
      {cols?.map((col, i) => (
        <Col col={col} key={i} onSourceChange={onSourceChange} />
      ))}
    </div>
  );
}

const useSavedLayout = createLocalStorageStateHook<Layout | undefined>(
  "__tele_layout__"
);

const MonitorPage: NextPage = () => {
  const [layout, setLayout] = useSavedLayout();
  useEffect(() => {
    if (!layout) setLayout(initialLayout);
  });
  const handleSelectSource = (node: SourceNode) => {
    setLayout((l) => {
      const layoutClone = clone(l);
      if (!layoutClone) return layoutClone;

      const findInRow = (row: Row) => {
        if (row.cols) {
          for (const col of row.cols) {
            findInCol(col);
          }
        }
      };
      const findInCol = (col: Col) => {
        if (col.node?.uuid === node.uuid) {
          col.node = node;
          return;
        }
        if (col.rows) {
          for (const row of col.rows) {
            findInRow(row);
          }
        }
      };
      findInCol(layoutClone);
      return layoutClone;
    });
  };

  return (
    <div>
      <Head>
        <title>Tele - Layout</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {layout && <Col col={layout} onSourceChange={handleSelectSource} />}
      {/* <ReactTwitchEmbedVideo channel="seba_parrab" /> */}
    </div>
  );
};

export default MonitorPage;
