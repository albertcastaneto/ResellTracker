type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'blue' | 'green' | 'gray'

const classes: Record<Variant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger:  'bg-red-100 text-red-800',
  info:    'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-600',
  purple:  'bg-purple-100 text-purple-800',
  blue:    'bg-blue-100 text-blue-800',
  green:   'bg-green-100 text-green-800',
  gray:    'bg-gray-100 text-gray-600',
}

interface Props {
  variant?: Variant
  label: string
}

export function Badge({ variant = 'neutral', label }: Props) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${classes[variant]}`}>
      {label}
    </span>
  )
}
