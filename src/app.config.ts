import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import Material from '@primeuix/themes/material';
import { definePreset } from '@primeuix/themes';
import { MsalService, MsalGuard, MsalBroadcastService, MSAL_INSTANCE, MSAL_GUARD_CONFIG, MsalInterceptorConfiguration, MsalGuardConfiguration, MSAL_INTERCEPTOR_CONFIG } from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication, InteractionType, LogLevel } from '@azure/msal-browser';
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { MessageService } from 'primeng/api';
import { provideEchartsCore } from 'ngx-echarts';

registerLocaleData(localeEsPe, 'es-PE');

// ── Configuración de MSAL ──
export function MSALInstanceFactory(): IPublicClientApplication {
    return new PublicClientApplication({
        auth: {
            clientId: 'b65e275c-ca73-4aac-b3e3-fd74c0658fd8',
            authority: 'https://login.microsoftonline.com/02157777-a391-40f4-b293-125e2aee9f72',
            redirectUri: 'http://localhost:4200/auth'
        },
        cache: {
            cacheLocation: 'localStorage',
            storeAuthStateInCookie: false
        },
        system: {
            loggerOptions: {
                loggerCallback: (level: LogLevel, message: string) => {
                    //console.log(message);
                },
                logLevel: LogLevel.Info,
                piiLoggingEnabled: false
            }
        }
    });
}

export function MSALInterceptorConfigFactory() {
    return {
        interactionType: InteractionType.Redirect,
        protectedResourceMap: new Map([['https://graph.microsoft.com/v1.0/me', ['User.Read']]])
    };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
    return {
        interactionType: InteractionType.Popup,
        authRequest: {
            scopes: ['openid', 'profile', 'email', 'User.Read']
        },
        loginFailedRoute: '/login-failed'
    };
}

const MyPreset = definePreset(Material, {
    semantic: {
        primary: {
            50: '{indigo.50}',
            100: '{indigo.100}',
            200: '{indigo.200}',
            300: '{indigo.300}',
            400: '{indigo.400}',
            500: '{indigo.500}',
            600: '{indigo.600}',
            700: '{indigo.700}',
            800: '{indigo.800}',
            900: '{indigo.900}',
            950: '{indigo.950}'
        }
    }
});


export const appConfig: ApplicationConfig = {
    
    providers: [
        provideEchartsCore({
      echarts: () => import('echarts')
    }),
        MessageService,
        provideRouter(
            appRoutes,
            withInMemoryScrolling({
                anchorScrolling: 'enabled',
                scrollPositionRestoration: 'enabled'
            }),
            withEnabledBlockingInitialNavigation()
        ),
        provideHttpClient(withFetch()),
        provideZonelessChangeDetection(),
        providePrimeNG({
            ripple: true,
            inputStyle: 'filled',
            theme: { preset: MyPreset, options: { darkModeSelector: '.app-dark' } },
            translation: {
                accept: 'Aceptar',
                reject: 'Rechazar',
                monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
            }
        }),
        { provide: LOCALE_ID, useValue: 'es-PE' },
        {
            provide: MSAL_INSTANCE,
            useFactory: MSALInstanceFactory
        },
        {
            provide: MSAL_GUARD_CONFIG,
            useFactory: MSALGuardConfigFactory
        },
        {
            provide: MSAL_INTERCEPTOR_CONFIG,
            useFactory: MSALInterceptorConfigFactory
        },
        
        // {
        //     provide: MSAL_INSTANCE,
        //     useFactory: MSALInstanceFactory
        // },
        // {
        //     provide: MSAL_GUARD_CONFIG,
        //     useValue: {
        //         interactionType: InteractionType.Redirect
        //     }
        // },
        MsalService,
        MsalGuard,
        MsalBroadcastService
    ]
};
