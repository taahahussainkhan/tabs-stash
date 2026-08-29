import { useState, useRef, useEffect } from 'react'
import { Search, X, Plus, ChevronDown } from 'lucide-react'
import { cn } from '../../../../lib/utils'

export interface AutocompleteOption {
    id: number
    label: string
    sublabel?: string
}

interface SearchableSingleSelectProps {
    label?: string
    placeholder?: string
    value: AutocompleteOption | null
    onChange: (selected: AutocompleteOption | null) => void
    onSearch: (query: string) => Promise<AutocompleteOption[]>
    onCreate?: (name: string) => Promise<AutocompleteOption>
    required?: boolean
    allowClear?: boolean
    minimalist?: boolean
}

export function SearchableSingleSelect({
    label,
    placeholder = 'Search...',
    value,
    onChange,
    onSearch,
    onCreate,
    required = false,
    allowClear = true,
    minimalist = false,
}: SearchableSingleSelectProps) {
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
                setQuery('')
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
                    setOptions(results)
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
    }, [query, onSearch])

    const handleSelect = (option: AutocompleteOption) => {
        onChange(option)
        setQuery('')
        setOptions([])
        setIsOpen(false)
    }

    const handleClear = () => {
        onChange(null)
        setQuery('')
    }

    const handleCreate = async () => {
        if (!onCreate || !query.trim()) return

        setIsCreating(true)
        try {
            const newOption = await onCreate(query.trim())
            onChange(newOption)
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
        <div ref={wrapperRef} className={cn("relative w-full", minimalist && "min-h-[36px] flex items-center")}>
            {!minimalist && label && (
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-content-muted mb-1.5 px-0.5">
                    {label}
                    {required && <span className="text-danger ml-1">*</span>}
                </label>
            )}

            {/* Selected Value Display */}
            {value && !isOpen ? (
                <div className={cn("relative w-full", minimalist && "contents")}>
                    <div className={cn(
                        "flex items-center justify-between transition-colors",
                        minimalist ? "py-1" : "px-3 py-2 bg-[#15161a] border border-[#2e323c] rounded-[4px]"
                    )}>
                        <div
                            className="flex-1 cursor-pointer"
                            onClick={() => setIsOpen(true)}
                        >
                            <div className={cn(
                                "text-xs text-content-primary font-semibold",
                                minimalist && "text-xs"
                            )}>
                                {value.label}
                            </div>
                            {!minimalist && value.sublabel && (
                                <div className="text-[10px] font-mono text-content-muted mt-0.5">
                                    {value.sublabel}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5">
                            {allowClear && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="p-0.5 text-content-muted hover:text-danger transition-colors"
                                >
                                    <X size={13} />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsOpen(true)}
                                className="p-0.5 text-content-muted hover:text-content-primary transition-colors"
                            >
                                <ChevronDown size={13} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Search Input */
                <div className={cn("relative w-full", minimalist && "contents")}>
                    {!minimalist && (
                        <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
                            <Search className="w-3.5 h-3.5 text-content-muted" />
                        </div>
                    )}
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setIsOpen(true)
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        autoFocus={isOpen && minimalist}
                        className={cn(
                            "w-full focus:outline-none transition-colors",
                            minimalist
                                ? "bg-transparent border-none p-0 text-xs placeholder:text-content-muted/30"
                                : "bg-[#15161a] border border-[#2e323c] rounded-[4px] py-1.5 pl-8 pr-3 text-xs text-content-primary placeholder:text-content-muted focus:border-accent-vermillion"
                        )}
                    />
                </div>
            )}

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
