'use client';
import React, { useState } from 'react';
import { BsTwitch } from 'react-icons/bs';
import { useCustomTwitchAccounts } from '../../../hooks/useCustomTwitchAccounts';
import { SourceType } from '../../../sources';
import { SourceButton } from '../SourceButton/SourceButton';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../../../../components/ui/accordion';

const twitchSource = (account: string): SourceType => ({
  slug: `custom_twitch_${account}`,
  titleHtml: account,
  twitchAccount: account
});

type Props = {
  onSourceSelect: (source: SourceType) => void;
  selectedSourceSlug: string | undefined;
  accordionEventKey: string;
};
export function TwitchSelector({
  onSourceSelect,
  selectedSourceSlug,
  accordionEventKey
}: Props) {
  const [customTwitchValue, setCustomTwitchValue] = useState<string>('');
  const [accounts, setAccounts] = useCustomTwitchAccounts();

  const handleCreateSource = () => {
    const account = customTwitchValue.trim();
    if (!account) return;
    setAccounts(current =>
      current.includes(account) ? current : [...current, account]
    );
    onSourceSelect(twitchSource(account));
  };

  return (
    <AccordionItem value={accordionEventKey}>
      <AccordionTrigger>Twitch</AccordionTrigger>
      <AccordionContent>
        {accounts.map(account => {
          const source = twitchSource(account);
          return (
            <SourceButton
              onSelect={onSourceSelect}
              source={{ ...source, titleIcons: [<BsTwitch key="twitch" />] }}
              isSelected={source.slug === selectedSourceSlug}
              key={source.slug}
            />
          );
        })}
        <div className="mb-2 mt-4">
          <input
            type="text"
            value={customTwitchValue}
            placeholder="Canal de Twitch"
            onChange={e => setCustomTwitchValue(e.target.value)}
          />
        </div>
        <button onClick={handleCreateSource} className="btn btn-primary">
          Agregar
        </button>
      </AccordionContent>
    </AccordionItem>
  );
}
