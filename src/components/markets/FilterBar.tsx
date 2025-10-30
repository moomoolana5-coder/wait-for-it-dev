import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface FilterBarProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
}

export function FilterBar({
  sortBy,
  setSortBy,
  category,
  setCategory,
  search,
  setSearch,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex gap-2 flex-wrap">
        {['newest', 'trending', 'volume', 'ending', 'open'].map((sort) => (
          <Button
            key={sort}
            variant={sortBy === sort ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy(sort)}
            className="rounded-full capitalize"
          >
            {sort}
          </Button>
        ))}
      </div>

      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-[180px] rounded-xl">
          <SelectValue placeholder="All Tokens" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Crypto">Crypto</SelectItem>
          <SelectItem value="Sports">Sports</SelectItem>
          <SelectItem value="Politics">Politics</SelectItem>
          <SelectItem value="Economy">Economy</SelectItem>
          <SelectItem value="Gaming">Gaming</SelectItem>
          <SelectItem value="Culture">Culture</SelectItem>
          <SelectItem value="Sentiment">Sentiment</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search markets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>
    </div>
  );
}
