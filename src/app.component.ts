import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MSAL_INSTANCE } from '@azure/msal-angular';
import { IPublicClientApplication} from '@azure/msal-browser';
import { LocalStorageService } from './app/pages/service/localStorage.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent {
    private msalState = inject<IPublicClientApplication>(MSAL_INSTANCE);

  constructor(
    private localStorageService: LocalStorageService,
  ){
    localStorageService.rehydrate();
  }

  ngOnInit() {
    this.msalState.initialize();

   
  }
}
