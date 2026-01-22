'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface SearchInputProps {
  className?: string;
  autoFocus?: boolean;
  onSearch?: (bibNumber: string) => void;
}

export function SearchInput({ className, autoFocus = false, onSearch }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bibNumber, setBibNumber] = useState(searchParams.get('bib') || '');
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const validateBibNumber = useCallback((value: string): boolean => {
    // Bib numbers should be numeric and reasonable length
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Please enter a bib number');
      return false;
    }
    if (!/^\d+$/.test(trimmed)) {
      setError('Please enter a valid bib number (numbers only)');
      return false;
    }
    if (trimmed.length > 10) {
      setError('Bib number is too long');
      return false;
    }
    setError(null);
    return true;
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!validateBibNumber(bibNumber)) {
        return;
      }

      setIsSearching(true);

      try {
        if (onSearch) {
          onSearch(bibNumber.trim());
        } else {
          // Navigate to search results
          const params = new URLSearchParams(searchParams.toString());
          params.set('bib', bibNumber.trim());
          router.push(`/search?${params.toString()}`);
        }
      } finally {
        setIsSearching(false);
      }
    },
    [bibNumber, onSearch, router, searchParams, validateBibNumber]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setBibNumber(value);
      if (error) {
        setError(null);
      }
    },
    [error]
  );

  return (
    <form onSubmit={handleSubmit} className={cn('w-full', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <div className="flex-1">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={bibNumber}
            onChange={handleInputChange}
            placeholder="Enter bib number"
            aria-label="Bib number"
            error={error || undefined}
            autoFocus={autoFocus}
            autoComplete="off"
            className="text-lg"
          />
        </div>
        <Button
          type="submit"
          loading={isSearching}
          disabled={isSearching}
          className="sm:w-auto"
          size="lg"
        >
          {isSearching ? 'Searching...' : 'Find Photos'}
        </Button>
      </div>
    </form>
  );
}
