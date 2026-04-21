import Head from 'next/head'
import { Toaster } from 'react-hot-toast'
import { Provider as ReduxProvider } from 'react-redux'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ReleaseNotesProvider } from '../contexts/release-notes-context'
import { SettingsConsumer, SettingsProvider } from '../contexts/settings-context'
import { RTL } from '../components/rtl'
import { store } from '../store'
import { createTheme } from '../theme'
import { createEmotionCache } from '../utils/create-emotion-cache'
import '../libs/nprogress'
import { PrivateRoute } from '../components/PrivateRoute'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMediaPredicate } from 'react-media-hook'
import Error500 from './500'
import { ErrorBoundary } from 'react-error-boundary'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import {
  enUS,
  enGB,
  nl,
  fr,
  de,
  es,
  it,
  pt,
  sv,
  da,
  nb,
  fi,
  is,
  pl,
  cs,
  sk,
  hu,
  ro,
  ru,
  enAU,
  enNZ,
} from 'date-fns/locale'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
import { PRODUCT_NAME } from '../constants/branding'
import React, { useEffect, useState } from 'react'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { installCippDevLocalAuth } from '../libs/cipp-dev-local-auth'

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then((d) => ({
    default: d.ReactQueryDevtools,
  }))
)
TimeAgo.addDefaultLocale(en)

const queryClient = new QueryClient()
const clientSideEmotionCache = createEmotionCache()
const App = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  const getLayout = Component.getLayout ?? ((page) => page)
  const preferredTheme = useMediaPredicate('(prefers-color-scheme: dark)') ? 'dark' : 'light'
  const [dateLocale, setDateLocale] = useState(enUS)

  useEffect(() => {
    if (typeof window === 'undefined') return
    installCippDevLocalAuth()

    const language = navigator.language || navigator.userLanguage || 'en-US'
    const baseLang = language.split('-')[0]

    const localeMap = {
      // English variants
      en: enUS,
      'en-US': enUS,
      'en-GB': enGB,
      'en-AU': enAU,
      'en-NZ': enNZ,

      // Western Europe
      nl: nl,
      'nl-NL': nl,
      fr: fr,
      'fr-FR': fr,
      de: de,
      'de-DE': de,
      es: es,
      'es-ES': es,
      it: it,
      'it-IT': it,
      pt: pt,
      'pt-PT': pt,
      'pt-BR': pt,

      // Scandinavia / Nordics
      sv: sv,
      'sv-SE': sv,
      da: da,
      'da-DK': da,
      nb: nb,
      'nb-NO': nb,
      fi: fi,
      'fi-FI': fi,
      is: is,
      'is-IS': is,

      // Eastern Europe
      pl: pl,
      'pl-PL': pl,
      cs: cs,
      'cs-CZ': cs,
      sk: sk,
      'sk-SK': sk,
      hu: hu,
      'hu-HU': hu,
      ro: ro,
      'ro-RO': ro,
      ru: ru,
      'ru-RU': ru,
    }

    const resolvedLocale = localeMap[language] || localeMap[baseLang] || enUS
    setDateLocale(resolvedLocale)
  }, [])

  const excludeQueryKeys = ['authmeswa', 'alertsDashboard']

  // 👇 Persist TanStack Query cache to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localStoragePersister = createSyncStoragePersister({
        storage: window.localStorage,
      })

      persistQueryClient({
        queryClient,
        persister: localStoragePersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        staleTime: 1000 * 60 * 5, // optional: 5 minutes
        buster: 'v1',
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const queryIsReadyForPersistence = query.state.status === 'success'
            if (queryIsReadyForPersistence) {
              const { queryKey } = query
              // Check if queryKey exists and has elements before accessing index 0
              if (!queryKey || !queryKey.length) {
                return false
              }
              const queryKeyString = String(queryKey[0] || '')
              const excludeFromPersisting = excludeQueryKeys.some((key) =>
                queryKeyString.includes(key)
              )
              return !excludeFromPersisting
            }
            return queryIsReadyForPersistence
          },
        },
      })
    }
  }, [])

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>{PRODUCT_NAME}</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
              <SettingsConsumer>
                {(settings) => {
                  // Create theme even while initializing to avoid blank screen
                  const theme = createTheme({
                    colorPreset: 'orange',
                    direction: settings.direction || 'ltr',
                    paletteMode:
                      settings.currentTheme?.value !== 'browser'
                        ? settings.currentTheme?.value || 'light'
                        : preferredTheme,
                    contrast: 'high',
                  })

                  return (
                    <>
                      <ThemeProvider theme={theme}>
                        <RTL direction={settings.direction}>
                          <CssBaseline />
                          <ErrorBoundary FallbackComponent={Error500}>
                            <PrivateRoute>
                              <ReleaseNotesProvider>
                                {getLayout(<Component {...pageProps} />)}
                              </ReleaseNotesProvider>
                            </PrivateRoute>
                          </ErrorBoundary>
                          <Toaster position="top-center" />
                        </RTL>
                      </ThemeProvider>
                      {settings.isInitialized && settings?.showDevtools === true ? (
                        <React.Suspense fallback={null}>
                          <ReactQueryDevtoolsProduction />
                        </React.Suspense>
                      ) : null}
                    </>
                  )
                }}
              </SettingsConsumer>
            </LocalizationProvider>
          </SettingsProvider>
        </QueryClientProvider>
      </ReduxProvider>
    </CacheProvider>
  )
}

export default App
