import { useState, useRef, useEffect } from 'react'
import { Search, X, Plus } from 'lucide-react'
import { cn } from '../../../../lib/utils'

export interface AutocompleteOption {
    id: number | string
    label: string
    sublabel?: string
    color?: string
}

interface SearchableMultiSelectProps {
    label?: string
    placeholder?: string
    value: AutocompleteOption[]
    onChange: (selected: AutocompleteOption[]) => void
    onSearch: (query: string) => Promise<AutocompleteOption[]>
    onCreate?: (name: string) => Promise<AutocompleteOption>
    required?: boolean
    maxSelections?: number
    minimalist?: boolean
}

export function SearchableMultiSelect({
    label,
    placeholder = 'Search...',
    value,
    onChange,
    onSearch,
    onCreate,
    required = false,
    maxSelections,
    minimalist = false,
}: SearchableMultiSelectProps) {
    const [query, setQuery] = useState('')
    const [options, setOptions] = useState<AutocompleteOption[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Search when query changes
    useEffect(() => {
        if (query.length > 0) {
            setIsLoading(true)
            const timer = setTimeout(async () => {
                try {
                    const results = await onSearch(query)
                    const filtered = results.filter(
                        (opt) => !value.some((v) => v.id === opt.id)
                    )
                    setOptions(filtered)
                } catch (err) {
                    console.error('Search failed:', err)
                    setOptions([])
                } finally {
                    setIsLoading(false)
                }
            }, 300)
            return () => clearTimeout(timer)
        } else {
            setOptions([])
        }
    }, [query, value, onSearch])

    const handleSelect = (option: AutocompleteOption) => {
        if (maxSelections && value.length >= maxSelections) {
            return
        }
        onChange([...value, option])
        setQuery('')
        setOptions([])
        setIsOpen(false)
    }

    const handleRemove = (id: number | string) => {
        onChange(value.filter((v) => v.id !== id))
    }

    const handleCreate = async () => {
        if (!onCreate || !query.trim()) return

        setIsCreating(true)
        try {
            const newOption = await onCreate(query.trim())
            onChange([...value, newOption])
            setQuery('')
            setOptions([])
            setIsOpen(false)
        } catch (err) {
            console.error('Create failed:', err)
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div ref={wrapperRef} className={cn("relative w-full", minimalist && "min-h-[36px] flex flex-wrap items-center gap-1.5")}>
            {!minimalist && label && (
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-content-muted mb-1.5 px-0.5">
                    {label}
                    {required && <span className="text-danger ml-1">*</span>}
                    {maxSelections && (
                        <span className="text-content-muted/60 text-[10px] ml-1">
                            ({value.length}/{maxSelections})
                        </span>
                    )}
                </label>
            )}

            {/* Selected Pills + Input Container */}
            <div
                className={cn(
                    "flex flex-wrap items-center gap-1.5 transition-colors cursor-text",
                    minimalist
                        ? "contents"
                        : "bg-[#15161a] border border-[#2e323c] rounded-[4px] p-1.5 focus-within:border-accent-vermillion"
                )}
                onClick={() => wrapperRef.current?.querySelector('input')?.focus()}
            >
                {/* Selected Pills */}
                {value.map((item) => (
                    <span
                        key={item.id}
                        className="mono-badge mono-badge-neutral text-[10px] py-0.5 px-1.5"
                    >
                        {item.label}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleRemove(item.id)
                            }}
                            className="hover:text-danger ml-1"
                        >
                            <X size={11} />
                        </button>
                    </span>
                ))}

                {/* Input */}
                {(!maxSelections || value.length < maxSelections) && (
                    <div className="flex-1 min-w-[120px] relative flex items-center">
                        {!minimalist && value.length === 0 && (
                            <Search className="w-3.5 h-3.5 text-content-muted mr-1.5 shrink-0" />
                        )}
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value)
                                setIsOpen(true)
                            }}
                            onFocus={() => setIsOpen(true)}
                            placeholder={value.length === 0 ? placeholder : 'Add more...'}
                            className={cn(
                                "w-full bg-transparent border-none outline-none text-xs text-content-primary placeholder:text-content-muted",
                                minimalist && "text-xs placeholder:text-content-muted/30"
                            )}
                        />
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-[#1e2026] border border-[#2e323c] rounded-[6px] shadow-2xl max-h-60 overflow-y-auto left-0">
                    {query.length === 0 ? (
                        <div className="px-3 py-2 text-xs font-mono text-content-muted text-center cursor-default">
                            Type to search...
                        </div>
                    ) : isLoading ? (
                        <div className="px-3 py-2 text-xs font-mono text-content-muted text-center cursor-default">
                            Searching...
                        </div>
                    ) : options.length > 0 ? (
                        <div className="py-1">
                            {options.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className="w-full px-3 py-1.5 text-left hover:bg-[#262830] transition-colors flex flex-col rounded-[3px]"
                                >
                                    <span className="text-xs text-content-primary font-medium">
                                        {option.label}
                                    </span>
                                    {option.sublabel && (
                                        <span className="text-[10px] font-mono text-content-muted mt-0.5">
                                            {option.sublabel}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : onCreate ? (
                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="w-full px-3 py-2 text-left hover:bg-[#262830] transition-colors flex items-center gap-2 text-xs font-bold text-accent-vermillion"
                        >
                            <Plus size={14} />
                            <span>
                                {isCreating ? 'Creating...' : `Create "${query}"`}
                            </span>
                        </button>
                    ) : (
                        <div className="px-3 py-2 text-xs font-mono text-content-muted text-center cursor-default">
                            No results found
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
