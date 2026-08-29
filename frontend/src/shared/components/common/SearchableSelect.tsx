import { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Search } from 'lucide-react'

interface SearchableSelectProps {
  options: { value: string | number; label: string }[]
  value?: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  className?: string
  error?: string | boolean
  label?: string
  labelSize?: 'sm' | 'md'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select...', 
  className = '',
  error = false,
  label,
  labelSize = 'sm',
  rounded = 'lg'
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const generatedId = useId()
  const inputId = generatedId

  const selectedOption = options.find(opt => opt.value === value)
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const roundedClass = 
    rounded === 'none' ? 'rounded-none' :
    rounded === 'sm' ? 'rounded-sm' :
    rounded === 'md' ? 'rounded-md' :
    rounded === 'lg' ? 'rounded-lg' :
    rounded === 'xl' ? 'rounded-xl' :
    rounded === 'full' ? 'rounded-full' :
    'rounded-2xl'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className={`form-control w-full group relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className={`label ${labelSize === 'sm' ? 'py-1' : 'pb-2'} px-1 group-focus-within:text-pastel-lavender transition-colors`} htmlFor={inputId}>
          <span className={`label-text ${labelSize === 'sm' ? 'text-[10px]' : 'text-xs'} font-bold uppercase tracking-widest text-content-muted`}>{label}</span>
        </label>
      )}

      <button
        id={inputId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`input-modern w-full flex items-center justify-between text-left h-13 ${roundedClass} ${error ? 'border-pastel-rose/50 focus:border-pastel-rose/70' : ''}`}
      >
        <span className={selectedOption ? 'text-content-primary' : 'text-content-muted/50'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-content-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {error && typeof error === 'string' && (
        <label className="label pt-1.5 px-1">
          <span className="label-text-alt text-pastel-rose text-xs font-medium animate-in slide-in-from-top-1">{error}</span>
        </label>
      )}

      {isOpen && createPortal(
        <div className="fixed z-[9999] dropdown-content-premium overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().bottom + 8 : 0,
            left: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().left : 0,
            width: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().width : 'auto',
            maxHeight: '350px'
          }}
        >
          <div className="p-3 border-b border-white/5 bg-white/5">
            <div className="relative group/search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted group-focus-within/search:text-pastel-lavender transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                className="input-modern !h-10 w-full pl-10 text-sm !rounded-xl !bg-white/5 focus:!bg-white/10"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-[250px] p-2 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  style={{ transitionDelay: `${index * 20}ms` }}
                  className={`w-full dropdown-item-premium mb-1 last:mb-0 ${
                    option.value === value 
                      ? 'dropdown-item-premium-active' 
                      : ''
                  }`}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-sm text-content-muted/50 text-center italic">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                No results found
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
