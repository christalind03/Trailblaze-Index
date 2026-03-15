import { Avatar, AvatarImage } from '@/components/ui/Avatar';
import { STORAGE_URL } from '@/lib/constants';
import { cn } from '@/lib/utils';

type Props = {
  characterID: number;
  className?: string;
  size?: 'default' | 'lg' | 'sm';
};

export default function CharacterAvatar({
  characterID,
  className,
  size,
}: Props) {
  return (
    <Avatar
      className={cn('bg-secondary after:border-0', className)}
      size={size}
    >
      <AvatarImage src={`${STORAGE_URL}/characters/${characterID}.png`} />
    </Avatar>
  );
}
