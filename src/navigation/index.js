import React from 'react';
import {Provider as PaperProvider} from 'react-native-paper';
import {AuthProvider} from './AuthProvider';
import {LicensingProvider} from '../components/LicensingProvider';
import ErrorReporter from '../meta/ErrorReporter';
import Routes from './Routes';

/**
 * Provider wrappers for App
 */
export default function Providers() {
  return (
    <PaperProvider>
      <ErrorReporter>
        <AuthProvider>
          <LicensingProvider>
            <Routes />
          </LicensingProvider>
        </AuthProvider>
      </ErrorReporter>
    </PaperProvider>
  );
}
