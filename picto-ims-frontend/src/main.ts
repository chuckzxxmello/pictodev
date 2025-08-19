import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi  } from '@angular/common/http';
import { apiInterceptor } from './app/interceptors/api.interceptor';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes)
  ]
}).catch(console.error);
