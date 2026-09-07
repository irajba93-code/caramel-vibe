'use client'

import React from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

interface SortableHeaderProps {
  field: string
  currentSortField: string
  currentSortDirection: 'asc' | 'desc'
  onSort: (field: string) => void
  children: React.ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
}

export function SortableHeader({
  field,
  currentSortField,
  currentSortDirection,
  onSort,
  children,
  className = '',
  align = 'left',
}: SortableHeaderProps) {
  const isSorted = currentSortField === field
  const alignClass =
    align === 'right' ? 'justify-end text-right' : align === 'center' ? 'justify-center text-center' : 'justify-start text-left'

  return (
    <th
      onClick={() => onSort(field)}
      className={`py-3.5 px-4 cursor-pointer select-none group transition-colors hover:bg-muted/50 ${
        isSorted ? 'text-primary font-black bg-primary/5' : 'text-muted-foreground'
      } ${className}`}
      title={`Sort by ${typeof children === 'string' ? children : field} (${
        isSorted && currentSortDirection === 'asc' ? 'Descending' : 'Ascending'
      })`}
    >
      <div className={`flex items-center gap-1.5 ${alignClass}`}>
        <span className="truncate">{children}</span>
        <span className="shrink-0 inline-flex items-center">
          {isSorted ? (
            currentSortDirection === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-primary stroke-[2.5]" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-primary stroke-[2.5]" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
          )}
        </span>
      </div>
    </th>
  )
}
