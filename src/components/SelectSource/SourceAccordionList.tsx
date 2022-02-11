import React, { useState } from "react";
import { Accordion } from "react-bootstrap";
import { BsTwitch } from "react-icons/bs";
import { useCustomSources } from "../../pages/grid/index.page";
import { Source, sourcesCategories } from "../../sources";
import { SourceButton } from "./SourceButton/SourceButton";

type Props = {
  selectedSourceSlug?: string;
  onSelect?: (source: Source) => void;
};
export function SourceAccordionList({ onSelect, selectedSourceSlug }: Props) {
  const [customTwitchValue, setCustomTwitchValue] = useState<string>("");
  const [customSources, setCustomSources] = useCustomSources();
  const handleCreateSource = () => {
    const newSource: Source = {
      slug: `custom_${customTwitchValue}`,
      titleHtml: customTwitchValue,
      twitchAccount: customTwitchValue,
    };
    setCustomSources((v) => [...(v || []), newSource]);
  };
  return (
    <Accordion defaultActiveKey="0" className="w-100">
      <Accordion.Item eventKey={`0`}>
        <Accordion.Header>Mis canales de twitch</Accordion.Header>
        <Accordion.Body>
          {customSources?.map((source) => (
            <SourceButton
              onSelect={onSelect}
              source={{ ...source, titleIcons: [<BsTwitch key="twitch" />] }}
              isSelected={source.slug === selectedSourceSlug}
              key={source.slug}
            />
          ))}
          <div className="mb-2">
            <BsTwitch size={24} className="mr-1" />
            <input
              type="text"
              value={customTwitchValue}
              placeholder="Introduce el nombre"
              onChange={(e) => setCustomTwitchValue(e.target.value)}
            />
          </div>
          <button onClick={handleCreateSource} className="btn btn-primary">
            Agregar
          </button>
        </Accordion.Body>
      </Accordion.Item>
      {sourcesCategories.map((sourceCategory, idx) => (
        <Accordion.Item eventKey={`${idx + 1}`} key={sourceCategory.name}>
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
