import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Accessible, reusable Button component with variants
 *
 * @example
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

    const variants = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
      outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    }

    const sizes = {
      sm: 'py-1.5 px-4 text-sm',
      md: 'py-2.5 px-6 text-base',
      lg: 'py-3 px-8 text-lg',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
