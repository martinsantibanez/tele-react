import React from "react";
import { Accordion } from "react-bootstrap";
import { Source, SourceGroup, sourcesCategories } from "../../sources";
import { SourceButton } from "./SourceButton";

type Props = {
  selectedSourceSlug?: string;
  onSelect?: (source: Source) => void;
};
export function SourceAccordionList({ onSelect, selectedSourceSlug }: Props) {
  return (
    <Accordion defaultActiveKey="0" className="w-100">
      {sourcesCategories.map((sourceCategory, idx) => (
        <Accordion.Item eventKey={`${idx}`} key={sourceCategory.name}>
          <Accordion.Header>{sourceCategory.name}</Accordion.Header>
          <Accordion.Body>
            {Object.values(sourceCategory.sources).map((source) => (
              <SourceButton
                onSelect={onSelect}
                source={source}
                isSelected={source.slug === selectedSourceSlug}
                key={source.slug}
              />
            ))}
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
