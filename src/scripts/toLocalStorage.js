import { browser } from '$app/environment';

export function toLocalStorage(store, storageKey) {
    if (browser) {
        store.subscribe(value => {
            let storageValue = (typeof value === 'object')
                ? JSON.stringify(value)
                : value

            window.localStorage.setItem(storageKey, storageValue)
        })
    }
}