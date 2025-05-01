import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { CreatePollComponent } from './components/poll/create-poll/create-poll.component';
import { ListPollsComponent } from './components/poll/list-polls/list-polls.component';
import { PollDetailsComponent } from './components/poll/poll-details/poll-details.component';
import { UserProfileComponent } from './components/user/user-profile/user-profile.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'polls', component: ListPollsComponent },
  { path: 'polls/create', component: CreatePollComponent, canActivate: [authGuard] },
  { path: 'polls/:id', component: PollDetailsComponent },
  { path: 'profile', component: UserProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];