type ToastType = 'success' | 'error' | 'warning' | 'info'
type ShowFn = (message: string, type?: ToastType) => void

let _show: ShowFn = () => {}

export function setGlobalShow(fn: ShowFn): void {
  _show = fn
}

export function globalShow(message: string, type: ToastType = 'error'): void {
  _show(message, type)
}
