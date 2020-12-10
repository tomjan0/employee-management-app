import {redirectLoggedInTo} from '@angular/fire/auth-guard';

export const redirectLoggedInToHome = () => redirectLoggedInTo('/');
