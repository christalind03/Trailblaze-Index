'use client';

import { SlidersHorizontal } from 'lucide-react';

import CharacterAvatar from '@/components/CharacterAvatar';
import {
  Combobox,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/Combobox';
import { Character } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  characterList: {
    characterDetails: Character;
    hasData: boolean;
  }[];
  onChange: (characterList: Character[]) => void;
};

export default function CharacterFilter({ characterList, onChange }: Props) {
  const comboboxAnchor = useComboboxAnchor();

  return (
    <Combobox
      autoHighlight
      items={characterList}
      multiple
      onValueChange={(updatedValues) => {
        const selectedCharacters = characterList
          .filter(({ characterDetails: { name } }) =>
            updatedValues.includes(name)
          )
          .map(({ characterDetails }) => characterDetails);

        onChange(selectedCharacters);
      }}
    >
      <ComboboxChips
        className="bg-secondary border-border p-3 focus-within:ring-0 has-aria-invalid:ring-0"
        ref={comboboxAnchor}
      >
        <ComboboxValue>
          {(comboboxValues) => {
            const hasValues = 0 !== comboboxValues.length;

            return (
              <div className="flex flex-row gap-3 items-center">
                <div
                  className={cn(
                    'flex flex-row gap-1.5 items-center font-medium text-muted-foreground',
                    hasValues && 'text-primary'
                  )}
                >
                  <SlidersHorizontal size={15} />
                  <span>Characters</span>
                </div>
                <ComboboxChipsInput
                  className="text-muted-foreground"
                  placeholder={
                    hasValues
                      ? `${comboboxValues.length} Character${comboboxValues.length === 1 ? '' : 's'}`
                      : 'All Characters'
                  }
                />
              </div>
            );
          }}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={comboboxAnchor} className="ring-0">
        <ComboboxEmpty>No results found.</ComboboxEmpty>
        <ComboboxList>
          {({ characterDetails: { id, name }, hasData }) => {
            if (hasData) {
              return (
                <ComboboxItem
                  className="flex flex-row gap-3 items-center text-center text-muted-foreground data-highlighted:font-medium data-highlighted:text-foreground"
                  key={id}
                  value={name}
                >
                  <CharacterAvatar characterID={id} />
                  {name}
                </ComboboxItem>
              );
            }
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
