import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg relative overflow-hidden text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive will-change-transform after:absolute after:inset-0 after:rounded-[inherit] after:bg-white/0 hover:after:bg-white/10 after:transition-opacity after:duration-200",
  {
    variants: {
      variant: {
        default:
          'bg-primary-600 text-white shadow-sm hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 ring-0 hover:ring-4 hover:ring-primary-600/20',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border border-primary-600 text-primary-600 bg-transparent shadow-xs hover:bg-primary-50 hover:text-primary-700 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02] ring-0 hover:ring-4 hover:ring-primary-600/15 dark:border-primary-500 dark:text-primary-400 dark:hover:bg-primary-950/40',
        secondary:
          'bg-neutral-100 text-neutral-900 shadow-xs hover:bg-neutral-200 hover:-translate-y-0.5',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
