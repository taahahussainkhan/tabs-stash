import React from 'react'
import { AnyForm } from '@tanstack/react-form'
import { z } from 'zod'

interface FormAutoFieldsProps {
  form: AnyForm
  schema: z.ZodObject<any>
}

export function FormAutoFields({ form, schema }: FormAutoFieldsProps) {
  const shape = schema.shape

  return (
    <>
      {Object.keys(shape).map((key) => {
        const fieldSchema = shape[key]
        let label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
        let type = 'text'
        
        // Basic type inference
        if (fieldSchema instanceof z.ZodNumber) type = 'number'
        if (fieldSchema instanceof z.ZodBoolean) type = 'checkbox'
        if (key.includes('password')) type = 'password'
        if (key.includes('date')) type = 'date'
        
        return (
          <form.Field
            key={key}
            name={key as any}
            children={(field) => (
              <div className="space-y-2 mb-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-content-muted px-1">
                  {label}
                </label>
                {type === 'checkbox' ? (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.checked as any)}
                      className="w-5 h-5 rounded-lg border-white/10 bg-white/5 checked:bg-pastel-blue checked:border-pastel-blue transition-all"
                    />
                    <span className="text-sm text-content-secondary">Enabled</span>
                  </div>
                ) : (
                  <input
                    type={type}
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(type === 'number' ? Number(e.target.value) : e.target.value as any)}
                    placeholder={`Enter ${label.toLowerCase()}...`}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-pastel-blue/20 focus:border-pastel-blue/20 transition-all"
                  />
                )}
                {field.state.meta.errors && (
                  <p className="text-[10px] text-pastel-rose font-medium px-1">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          />
        )
      })}
    </>
  )
}
