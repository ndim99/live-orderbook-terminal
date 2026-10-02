import { cva, type VariantProps } from 'class-variance-authority';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';
import { cn } from '~/lib/utils';

const variants = cva(
  [
    'inline-flex items-center justify-center rounded-lg outline-none select-none cursor-pointer',
    'transition-colors disabled:cursor-not-allowed disabled:opacity-40',
    'data-pending:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-accent text-white hover:brightness-110 border border-transparent',
        secondary: 'bg-bg-secondary border border-border text-text-primary hover:bg-bg-elevated',
        outline: 'bg-transparent border border-border hover:border-border-strong',
        ghost: 'bg-transparent border-0 hover:text-text-primary text-text-secondary',
        yes: 'bg-bg-yes text-yes border border-transparent',
        no: 'bg-bg-no text-no border border-transparent',
      },
      size: {
        sm: 'px-3 h-9 text-sm',
        md: 'px-4 h-10 text-sm',
        lg: 'px-6 h-12 text-base font-semibold',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
);

export interface ButtonProps extends AriaButtonProps, VariantProps<typeof variants> {
  className?: string;
  isPending?: boolean;
}

export default function Button({
  className,
  variant,
  size,
  isPending,
  children,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      {...props}
      isDisabled={props.isDisabled || isPending}
      className={cn(variants({ variant, size }), className)}
    >
      {isPending ? '…' : children}
    </AriaButton>
  );
}
