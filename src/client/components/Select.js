export const selectTheme = (theme) => ({
  ...theme,
  colors: { 
    ...theme.colors,
    primary: 'var(--foreground-color)',
  },
})

export const selectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    backgroundColor: 'var(--background-color)',
    borderColor: 'var(--foreground-color)',
  }),
  menu: (baseStyles, state) => ({
    ...baseStyles,
    backgroundColor: 'var(--background-color)',
  }),
  
};