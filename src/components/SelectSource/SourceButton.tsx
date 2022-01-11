import React from "react";
import { Source } from "../../sources";

type Props = {
  source: Source;
  isSelected?: boolean;
  onSelect?: (source: Source) => void;
};
export function SourceButton({ source, onSelect, isSelected }: Props) {
  return (
    <button
      title={source.slug}
      key={source.slug}
      className={`btn ${
        isSelected ? "BotonTV_SeñalSeleccionada" : "BotonTV_Señales"
      }`}
      onClick={() => onSelect && onSelect(source)}
      dangerouslySetInnerHTML={{
        __html: source.titleHtml,
      }}
    />
  );
}
