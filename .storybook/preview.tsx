import type { Preview, Decorator } from '@storybook/react-vite'
import { useEffect } from 'react'

// Import the token layer so every story renders with the real design tokens.
// This file (src/index.css) is the single source of truth for the design system.
import '../src/index.css'

// Toolbar toggle that flips the `.dark` class — mirrors how the app switches the
// :root vs .dark token modes (the same two modes that map to Figma variable modes).
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? 'light'
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="bg-background text-foreground p-6">
      <Story />
    </div>
  )
}

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Token mode (light = :root, dark = .dark)',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
}

export default preview
