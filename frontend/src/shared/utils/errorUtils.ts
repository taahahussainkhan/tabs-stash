import { AxiosError } from 'axios'

export function getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        const response = error.response
        if (!response) {
            return error.message || 'Network error occurred'
        }

        const data = response.data

        // Handle project's standardized error response
        if (data?.error) {
            const errorObj = data.error
            if (errorObj.details?.errors && Array.isArray(errorObj.details.errors)) {
                return errorObj.details.errors.map((err: any) => {
                    return `${err.field}: ${err.message}`
                }).join(', ')
            }
            return errorObj.message || 'An error occurred'
        }

        // Handle FastAPI default validation errors (422) if not wrapped by custom handler
        if (response.status === 422 && data?.detail) {
            if (Array.isArray(data.detail)) {
                return data.detail.map((err: any) => {
                    const field = err.loc[err.loc.length - 1]
                    return `${field}: ${err.msg}`
                }).join(', ')
            }
            return typeof data.detail === 'string' ? data.detail : 'Validation error'
        }

        // Handle standard detail field
        if (data?.detail) {
            return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
        }

        // Handle generic message
        if (data?.message) {
            return data.message
        }

        return `Error ${response.status}: ${response.statusText || 'Unknown error'}`
    }

    if (error instanceof Error) {
        return error.message
    }

    return 'An unexpected error occurred'
}
