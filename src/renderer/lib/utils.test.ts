import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
  it('merges multiple string classes', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('handles conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2')
  })

  it('merges tailwind classes using tailwind-merge', () => {
    // p-4 and p-8 are conflicting tailwind classes, p-8 should win
    expect(cn('p-4 text-red-500', 'p-8')).toBe('text-red-500 p-8')
  })

  it('handles null, undefined, arrays, and objects', () => {
    expect(cn(
      'class1',
      null,
      undefined,
      ['class2', 'class3'],
      { 'class4': true, 'class5': false }
    )).toBe('class1 class2 class3 class4')
  })

  it('merges complex combinations', () => {
    expect(cn(
      'bg-blue-500 text-white',
      { 'bg-red-500': true },
      ['font-bold', 'text-sm'],
      'p-4'
    )).toBe('text-white bg-red-500 font-bold text-sm p-4')
  })
})
