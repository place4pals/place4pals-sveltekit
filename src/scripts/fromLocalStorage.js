import { browser } from '$app/environment';

// Get value from localStorage if in browser and the value is stored, otherwise fallback
export function fromLocalStorage(storageKey, fallbackValue) {
    if (browser) {
        const storedValue = window.localStorage.getItem(storageKey)

        if (storedValue !== 'undefined' && storedValue !== null) {
            return (typeof fallbackValue === 'object')
                ? JSON.parse(storedValue)
                : storedValue
        }
    }

    return fallbackValue
}