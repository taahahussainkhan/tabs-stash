import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'

interface DropdownItem {
  value: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any
  path?: string
}

interface DropdownPropsBase {
  items: DropdownItem[]
  placeholder?: string
  className?: string
  disabled?: boolean
  position?: 'end' | 'start'
  buttonClassName?: string
  triggerIcon?: ReactNode
  hover?: boolean
  label?: string
  labelSize?: 'sm' | 'md'
}

interface FormDropdownProps extends DropdownPropsBase {
  mode?: 'form'
  value: string
  onChange: (value: string) => void
  basePath?: never
}

interface NavDropdownProps extends DropdownPropsBase {
  mode: 'navigation'
  basePath?: string
  value?: never
  onChange?: never
}

type DropdownProps = FormDropdownProps | NavDropdownProps

export function Dropdown(props: DropdownProps) {
  const {
    items,
    value,
    onChange,
    placeholder = 'Select an option',
    className = '',
    disabled = false,
    position = 'end',
    buttonClassName = 'nav-item',
    triggerIcon,
    hover = false,
    mode = 'form',
    basePath,
    label,
    labelSize = 'sm'
  } = props
  const location = useLocation()
  const selectedItem = mode === 'form' ? items.find(item => item.value === value) : null
  const displayText = selectedItem?.label || placeholder
  const isActive = (path: string) => location.pathname === path

  const isNavActive = mode === 'navigation' && basePath && location.pathname.startsWith(basePath)

  return (
    <div className={`dropdown ${hover ? 'dropdown-hover' : ''} ${position === 'end' ? 'dropdown-end' : 'dropdown-start'} ${className} w-full group`}>
      {label && (
        <label className={`label ${labelSize === 'sm' ? 'py-1' : 'pb-1.5'} px-0.5`}>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-content-muted">{label}</span>
        </label>
      )}
      <div
        tabIndex={0}
        role="button"
        className={`${buttonClassName} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${isNavActive ? 'nav-item-active' : ''} ${mode === 'form' ? 'bg-[#15161a] border border-[#2e323c] rounded-[4px] px-3 py-2 min-h-9 flex justify-between items-center w-full text-content-primary hover:border-[#3f4553] transition-colors cursor-pointer text-xs' : ''}`}
      >
        <div className="flex items-center gap-2">
          {triggerIcon && <span className="w-3.5 h-3.5 shrink-0">{triggerIcon}</span>}
          <span className={mode === 'form' ? 'text-xs font-normal' : ''}>{displayText}</span>
        </div>
        <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-200 ${hover ? 'group-hover:rotate-180' : 'group-focus-within:rotate-180'}`} />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu z-50 w-full min-w-[180px] p-1 mt-1 bg-[#1e2026] border border-[#2e323c] rounded-[6px] shadow-2xl animate-in fade-in duration-100"
      >
        {items.map((item) => (
          <li key={item.value} className="mb-0.5 last:mb-0">
            {mode === 'navigation' && item.path ? (
              <Link
                to={item.path}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs font-medium transition-colors ${
                  isActive(item.path) 
                    ? 'bg-[#262830] text-accent-vermillion font-bold' 
                    : 'text-content-secondary hover:text-white hover:bg-[#262830]'
                }`}
              >
                {item.icon && (() => {
                  const Icon = item.icon
                  return <Icon className="w-3.5 h-3.5 opacity-70" />
                })()}
                <span>{item.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => !disabled && onChange?.(item.value)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs font-medium transition-colors text-left ${
                  value === item.value 
                    ? 'bg-[#262830] text-accent-vermillion font-bold' 
                    : 'text-content-secondary hover:text-white hover:bg-[#262830]'
                }`}
              >
                {item.icon && (() => {
                  const Icon = item.icon
                  return <Icon className="w-3.5 h-3.5 opacity-70" />
                })()}
                <span>{item.label}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
