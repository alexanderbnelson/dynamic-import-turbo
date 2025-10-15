import localFont from 'next/font/local'

const flatspotFont = localFont({
  src: [
    {
      path: './FlatspotNuovo-Book.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-flatspot'
})

export default flatspotFont;