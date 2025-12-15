import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export interface UsePaginationOptions {
  defaultPageSize?: number;
  pageSizeOptions?: number[];
}

export interface UsePaginationReturn {
  pageNo: number;
  pageSize: number;
  searchText: string;
  setPageNo: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearchText: (text: string) => void;
  pageSizeOptions: number[];
  resetToFirstPage: () => void;
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const { defaultPageSize = 10, pageSizeOptions = [10, 25, 50] } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  const pageNo = useMemo(() => {
    const page = parseInt(searchParams.get('pageNo') || '1', 10);
    return isNaN(page) || page < 1 ? 1 : page;
  }, [searchParams]);

  const pageSize = useMemo(() => {
    const size = parseInt(searchParams.get('pageSize') || String(defaultPageSize), 10);
    return pageSizeOptions.includes(size) ? size : defaultPageSize;
  }, [searchParams, defaultPageSize, pageSizeOptions]);

  const searchText = useMemo(() => {
    return searchParams.get('searchText') || '';
  }, [searchParams]);

  const setPageNo = useCallback((page: number) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('pageNo', String(page));
      return newParams;
    });
  }, [setSearchParams]);

  const setPageSize = useCallback((size: number) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('pageSize', String(size));
      newParams.set('pageNo', '1'); // Reset to first page
      return newParams;
    });
  }, [setSearchParams]);

  const setSearchText = useCallback((text: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (text) {
        newParams.set('searchText', text);
      } else {
        newParams.delete('searchText');
      }
      newParams.set('pageNo', '1'); // Reset to first page
      return newParams;
    });
  }, [setSearchParams]);

  const resetToFirstPage = useCallback(() => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('pageNo', '1');
      return newParams;
    });
  }, [setSearchParams]);

  return {
    pageNo,
    pageSize,
    searchText,
    setPageNo,
    setPageSize,
    setSearchText,
    pageSizeOptions,
    resetToFirstPage,
  };
}
