import { CharacterAvatar } from '@/components/CharacterAvatar';
import { AvatarGroup, AvatarGroupCount } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

type Props = {
  characterList: number[];
  groupCount?: number;
};

const ICON_SIZE = 'size-5';

export function CharacterAvatarGroup({ characterList, groupCount = 0 }: Props) {
  return (
    <AvatarGroup className="*:data-[slot=avatar]:ring-0">
      {characterList.map((characterID) => (
        <CharacterAvatar
          characterID={characterID}
          className={ICON_SIZE}
          key={characterID}
        />
      ))}
      {groupCount !== 0 && (
        <AvatarGroupCount className={cn('text-[10px]', ICON_SIZE)}>
          +{groupCount}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  );
}
