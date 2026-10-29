import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Root } from './src/app/Root';
import { QueryProvider } from './src/core/query';
import { ToastProvider } from './src/design';

/**
 * Providers only - the shell lives in src/app/Root.
 *
 * Order matters: safe-area first (the toast and the keyboard hooks read insets),
 * then the query cache, then the toast overlay so it floats above every screen.
 */
export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar barStyle="light-content" />
      <QueryProvider>
        <ToastProvider>
          <Root />
        </ToastProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
