import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SearchPageComponent } from './components/search-page/search-page.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {path: 'login', component : LoginComponent},
  { path: 'searchPage', component: SearchPageComponent, canActivate: [AuthGuard] },
  {path: '', redirectTo: '/login', pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
